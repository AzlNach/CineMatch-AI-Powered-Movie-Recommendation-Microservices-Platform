const ScheduleModel = require('../models/ScheduleModel');
const axios = require('axios');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const { enriched } = req.query;
    
    if (enriched === 'true') {
      const schedules = await ScheduleModel.getAllSchedulesEnriched();
      return res.json(schedules);
    }
    
    const schedules = await ScheduleModel.getAllSchedules();
    res.json(schedules);
  } catch (error) {
    console.error('Error in getAllSchedules:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const { enriched } = req.query;
    
    const schedule = await ScheduleModel.getScheduleById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    if (enriched === 'true') {
      const enrichedSchedule = await ScheduleModel.enrichSchedule(schedule);
      return res.json(enrichedSchedule);
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Error in getScheduleById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get schedules by movie ID
exports.getSchedulesByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const schedules = await ScheduleModel.getSchedulesByMovie(movieId);
    
    // Optionally: Fetch movie details from movie service
    // const movieResponse = await axios.get(`http://localhost:3002/movies/${movieId}`);
    // const movie = movieResponse.data;
    
    // Optionally: Fetch theater details for each schedule
    // const schedulesWithDetails = await Promise.all(schedules.map(async (schedule) => {
    //   const theaterResponse = await axios.get(`http://localhost:3003/theaters/${schedule.theater_id}`);
    //   return { ...schedule, theater: theaterResponse.data };
    // }));
    
    res.json(schedules);
  } catch (error) {
    console.error('Error in getSchedulesByMovie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get schedules by theater ID
exports.getSchedulesByTheater = async (req, res) => {
  try {
    const theaterId = req.params.theaterId;
    const schedules = await ScheduleModel.getSchedulesByTheater(theaterId);
    res.json(schedules);
  } catch (error) {
    console.error('Error in getSchedulesByTheater:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get schedules by date
exports.getSchedulesByDate = async (req, res) => {
  try {
    const date = req.params.date; // Expected format: YYYY-MM-DD
    const schedules = await ScheduleModel.getSchedulesByDate(date);
    res.json(schedules);
  } catch (error) {
    console.error('Error in getSchedulesByDate:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new schedule
exports.createSchedule = async (req, res) => {
  try {
    const scheduleData = req.body;
    
    if (!scheduleData.movie_id || !scheduleData.screen_id || !scheduleData.theater_id ||
        !scheduleData.start_time || !scheduleData.end_time || !scheduleData.price) {
      return res.status(400).json({ 
        error: 'Movie ID, screen ID, theater ID, start time, end time, and price are required' 
      });
    }
    
    // 1. Validasi movie_id - cek apakah movie ada
    try {
      const movieResponse = await axios.get(`http://localhost:3002/movies/${scheduleData.movie_id}`);
      if (!movieResponse.data) {
        return res.status(404).json({ error: 'Movie not found' });
      }
    } catch (err) {
      console.error('Error validating movie:', err);
      return res.status(404).json({ error: 'Movie not found or movie service unavailable' });
    }
    
    // 2. Validasi theater_id - cek apakah theater ada
    try {
      const theaterResponse = await axios.get(`http://localhost:3003/theaters/${scheduleData.theater_id}`);
      if (!theaterResponse.data) {
        return res.status(404).json({ error: 'Theater not found' });
      }
    } catch (err) {
      console.error('Error validating theater:', err);
      return res.status(404).json({ error: 'Theater not found or theater service unavailable' });
    }
    
    // 3. Validasi screen_id dan kaitannya dengan theater_id
    try {
      const screenResponse = await axios.get(`http://localhost:3003/screens/${scheduleData.screen_id}`);
      
      if (!screenResponse.data) {
        return res.status(404).json({ error: 'Screen not found' });
      }
      
      // Pastikan screen ini memang milik theater yang dispesifikasi
      if (screenResponse.data.theater_id !== parseInt(scheduleData.theater_id)) {
        return res.status(400).json({ 
          error: 'Screen does not belong to the specified theater',
          providedTheaterId: scheduleData.theater_id,
          actualTheaterId: screenResponse.data.theater_id
        });
      }
      
      // Set available seats based on screen capacity jika tidak disediakan
      if (!scheduleData.available_seats) {
        scheduleData.available_seats = screenResponse.data.capacity;
      }
    } catch (err) {
      console.error('Error validating screen:', err);
      return res.status(404).json({ error: 'Screen not found or theater service unavailable' });
    }
    
    // 4. Cek konflik jadwal untuk screen tersebut
    const hasConflict = await ScheduleModel.checkTimeConflicts(
      scheduleData.screen_id,
      scheduleData.start_time,
      scheduleData.end_time
    );
    
    if (hasConflict) {
      return res.status(400).json({ error: 'Time conflict with existing schedule' });
    }
    
    // 5. Semua validasi passed, simpan jadwal
    const scheduleId = await ScheduleModel.createSchedule(scheduleData);
    const newSchedule = await ScheduleModel.getScheduleById(scheduleId);
    
    // 6. Enrich response dengan detail dari microservices lain
    try {
      // Get movie details
      const movieResponse = await axios.get(`http://localhost:3002/movies/${newSchedule.movie_id}`);
      newSchedule.movie = movieResponse.data;
      
      // Get theater details
      const theaterResponse = await axios.get(`http://localhost:3003/theaters/${newSchedule.theater_id}`);
      newSchedule.theater = theaterResponse.data;
      
      // Get screen details
      const screenResponse = await axios.get(`http://localhost:3003/screens/${newSchedule.screen_id}`);
      newSchedule.screen = screenResponse.data;
    } catch (err) {
      console.error('Error enriching schedule data:', err);
      // Continue with basic schedule data if enrichment fails
    }
    
    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error in createSchedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const scheduleData = req.body;
    
    const existingSchedule = await ScheduleModel.getScheduleById(scheduleId);
    if (!existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const updatedData = {
      movie_id: scheduleData.movie_id || existingSchedule.movie_id,
      screen_id: scheduleData.screen_id || existingSchedule.screen_id,
      theater_id: scheduleData.theater_id || existingSchedule.theater_id,
      start_time: scheduleData.start_time || existingSchedule.start_time,
      end_time: scheduleData.end_time || existingSchedule.end_time,
      price: scheduleData.price || existingSchedule.price,
      available_seats: scheduleData.available_seats !== undefined ? 
        scheduleData.available_seats : existingSchedule.available_seats
    };
    
    // Check for time conflicts if screen, start time, or end time changes
    if (scheduleData.screen_id !== existingSchedule.screen_id || 
        scheduleData.start_time !== existingSchedule.start_time || 
        scheduleData.end_time !== existingSchedule.end_time) {
      
      const hasConflict = await ScheduleModel.checkTimeConflicts(
        updatedData.screen_id,
        updatedData.start_time,
        updatedData.end_time,
        scheduleId
      );
      
      if (hasConflict) {
        return res.status(400).json({ error: 'Time conflict with existing schedule' });
      }
    }
    
    const updated = await ScheduleModel.updateSchedule(scheduleId, updatedData);
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update schedule' });
    }
    
    const updatedSchedule = await ScheduleModel.getScheduleById(scheduleId);
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error in updateSchedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    const schedule = await ScheduleModel.getScheduleById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const deleted = await ScheduleModel.deleteSchedule(scheduleId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete schedule' });
    }
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update available seats
exports.updateAvailableSeats = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const { availableSeats } = req.body;
    
    if (availableSeats === undefined) {
      return res.status(400).json({ error: 'Available seats count is required' });
    }
    
    const schedule = await ScheduleModel.getScheduleById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const updated = await ScheduleModel.updateAvailableSeats(scheduleId, availableSeats);
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update available seats' });
    }
    
    const updatedSchedule = await ScheduleModel.getScheduleById(scheduleId);
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Error in updateAvailableSeats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};