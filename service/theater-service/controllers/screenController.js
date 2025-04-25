const ScreenModel = require('../models/ScreenModel');
const TheaterModel = require('../models/TheaterModel');
const SeatModel = require('../models/SeatModel');

// Get all screens for a theater
exports.getScreensByTheaterId = async (req, res) => {
  try {
    const theaterId = req.params.theaterId;
    const theater = await TheaterModel.getTheaterById(theaterId);
    
    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    const screens = await ScreenModel.getScreensByTheaterId(theaterId);
    res.json(screens);
  } catch (error) {
    console.error('Error in getScreensByTheaterId:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get screen by ID
exports.getScreenById = async (req, res) => {
  try {
    const screenId = req.params.id;
    const screen = await ScreenModel.getScreenById(screenId);
    
    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }
    
    res.json(screen);
  } catch (error) {
    console.error('Error in getScreenById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new screen
exports.createScreen = async (req, res) => {
  try {
    const screenData = req.body;
    
    if (!screenData.theater_id || !screenData.name || !screenData.capacity) {
      return res.status(400).json({ error: 'Theater ID, name, and capacity are required' });
    }
    
    // Verify theater exists
    const theater = await TheaterModel.getTheaterById(screenData.theater_id);
    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    // Set default screen type if not provided
    if (!screenData.screen_type) {
      screenData.screen_type = 'standard';
    }
    
    const screenId = await ScreenModel.createScreen(screenData);
    
    // Create seats if seating configuration is provided
    if (screenData.rows && screenData.seatsPerRow) {
      await SeatModel.createMultipleSeats(
        screenId, 
        screenData.rows, 
        screenData.seatsPerRow, 
        screenData.seat_type || 'standard'
      );
    }
    
    const screen = await ScreenModel.getScreenById(screenId);
    res.status(201).json(screen);
  } catch (error) {
    console.error('Error in createScreen:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update screen
exports.updateScreen = async (req, res) => {
  try {
    const screenId = req.params.id;
    const screenData = req.body;
    
    const existingScreen = await ScreenModel.getScreenById(screenId);
    if (!existingScreen) {
      return res.status(404).json({ error: 'Screen not found' });
    }
    
    const updatedScreenData = {
      name: screenData.name || existingScreen.name,
      capacity: screenData.capacity || existingScreen.capacity,
      screen_type: screenData.screen_type || existingScreen.screen_type
    };
    
    const updated = await ScreenModel.updateScreen(screenId, updatedScreenData);
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update screen' });
    }
    
    const updatedScreen = await ScreenModel.getScreenById(screenId);
    res.json(updatedScreen);
  } catch (error) {
    console.error('Error in updateScreen:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete screen
exports.deleteScreen = async (req, res) => {
  try {
    const screenId = req.params.id;
    const screen = await ScreenModel.getScreenById(screenId);
    
    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }
    
    const deleted = await ScreenModel.deleteScreen(screenId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete screen' });
    }
    
    res.json({ message: 'Screen deleted successfully' });
  } catch (error) {
    console.error('Error in deleteScreen:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get seats for a screen
exports.getScreenSeats = async (req, res) => {
  try {
    const screenId = req.params.id;
    const screen = await ScreenModel.getScreenById(screenId);
    
    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }
    
    const seats = await SeatModel.getSeatsByScreenId(screenId);
    res.json(seats);
  } catch (error) {
    console.error('Error in getScreenSeats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get available screens for a time slot
exports.getAvailableScreens = async (req, res) => {
  try {
    const { theaterId, date, startTime, endTime } = req.query;
    
    if (!theaterId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Theater ID, date, start time, and end time are required' });
    }
    
    const theater = await TheaterModel.getTheaterById(theaterId);
    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    // Format date and times
    const formattedStartTime = `${date} ${startTime}`;
    const formattedEndTime = `${date} ${endTime}`;
    
    const availableScreens = await ScreenModel.getAvailableScreens(
      theaterId, 
      date,
      formattedStartTime, 
      formattedEndTime
    );
    
    res.json(availableScreens);
  } catch (error) {
    console.error('Error in getAvailableScreens:', error);
    res.status(500).json({ error: 'Server error' });
  }
};