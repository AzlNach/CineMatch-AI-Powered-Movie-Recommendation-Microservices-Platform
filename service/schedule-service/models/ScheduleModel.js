const pool = require('../config/database');
const axios = require('axios');
const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';
const THEATER_SERVICE_URL = process.env.THEATER_SERVICE_URL || 'http://localhost:3003';

class ScheduleModel {
  async enrichSchedule(schedule) {
    try {
      // Get movie details
      const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`);
      schedule.movie = movieResponse.data;
      
      // Get theater details
      const theaterResponse = await axios.get(`${THEATER_SERVICE_URL}/theaters/${schedule.theater_id}`);
      schedule.theater = theaterResponse.data;
      
      // Get screen details
      const screenResponse = await axios.get(`${THEATER_SERVICE_URL}/screens/${schedule.screen_id}`);
      schedule.screen = screenResponse.data;
      
      return schedule;
    } catch (err) {
      console.error('Error enriching schedule data:', err);
      return schedule; 
    }
  }

  // Get all schedules with enriched data
  async getAllSchedulesEnriched() {
    const [rows] = await pool.execute(`
      SELECT * FROM show_times
      ORDER BY start_time
    `);
    
    // Enrich each schedule with data from other services
    const enrichedSchedules = await Promise.all(
      rows.map(schedule => this.enrichSchedule(schedule))
    );
    
    return enrichedSchedules;
  }

  // Metode lainnya...
  
  // Get all schedules
  async getAllSchedules() {
    const [rows] = await pool.execute(`
      SELECT * FROM show_times
      ORDER BY start_time
    `);
    return rows;
  }

  // Get schedule by ID
  async getScheduleById(scheduleId) {
    const [rows] = await pool.execute(
      'SELECT * FROM show_times WHERE id = ?',
      [scheduleId]
    );
    return rows[0];
  }

  // Get schedules by movie ID
  async getSchedulesByMovie(movieId) {
    const [rows] = await pool.execute(
      'SELECT * FROM show_times WHERE movie_id = ? ORDER BY start_time',
      [movieId]
    );
    return rows;
  }

  // Get schedules by theater ID
  async getSchedulesByTheater(theaterId) {
    const [rows] = await pool.execute(
      'SELECT * FROM show_times WHERE theater_id = ? ORDER BY start_time',
      [theaterId]
    );
    return rows;
  }

  // Get schedules by screen ID
  async getSchedulesByScreen(screenId) {
    const [rows] = await pool.execute(
      'SELECT * FROM show_times WHERE screen_id = ? ORDER BY start_time',
      [screenId]
    );
    return rows;
  }

  // Get schedules by date
  async getSchedulesByDate(date) {
    const [rows] = await pool.execute(
      'SELECT * FROM show_times WHERE DATE(start_time) = ? ORDER BY start_time',
      [date]
    );
    return rows;
  }

  // Create new schedule
  async createSchedule(scheduleData) {
    const { movie_id, screen_id, theater_id, start_time, end_time, price, available_seats } = scheduleData;
    const [result] = await pool.execute(
      'INSERT INTO show_times (movie_id, screen_id, theater_id, start_time, end_time, price, available_seats) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [movie_id, screen_id, theater_id, start_time, end_time, price, available_seats]
    );
    return result.insertId;
  }

  // Update schedule
  async updateSchedule(scheduleId, scheduleData) {
    const { movie_id, screen_id, theater_id, start_time, end_time, price, available_seats } = scheduleData;
    const [result] = await pool.execute(
      'UPDATE show_times SET movie_id = ?, screen_id = ?, theater_id = ?, start_time = ?, end_time = ?, price = ?, available_seats = ? WHERE id = ?',
      [movie_id, screen_id, theater_id, start_time, end_time, price, available_seats, scheduleId]
    );
    return result.affectedRows > 0;
  }

  // Delete schedule
  async deleteSchedule(scheduleId) {
    const [result] = await pool.execute(
      'DELETE FROM show_times WHERE id = ?',
      [scheduleId]
    );
    return result.affectedRows > 0;
  }

  // Update available seats
  async updateAvailableSeats(scheduleId, newAvailableSeats) {
    const [result] = await pool.execute(
      'UPDATE show_times SET available_seats = ? WHERE id = ?',
      [newAvailableSeats, scheduleId]
    );
    return result.affectedRows > 0;
  }

  // Check for time conflicts for a screen
  async checkTimeConflicts(screenId, startTime, endTime, excludeScheduleId = null) {
    let query = `
      SELECT id FROM show_times 
      WHERE screen_id = ? AND 
      ((start_time <= ? AND end_time > ?) OR 
       (start_time < ? AND end_time >= ?) OR 
       (start_time >= ? AND end_time <= ?))
    `;
    
    const params = [screenId, endTime, startTime, endTime, startTime, startTime, endTime];
    
    if (excludeScheduleId) {
      query += ' AND id != ?';
      params.push(excludeScheduleId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }
}

module.exports = new ScheduleModel();