const pool = require('../config/database');

class ScreenModel {
  // Get all screens for a theater
  async getScreensByTheaterId(theaterId) {
    const [rows] = await pool.execute('SELECT * FROM screens WHERE theater_id = ?', [theaterId]);
    return rows;
  }

  // Get screen by ID
  async getScreenById(screenId) {
    const [rows] = await pool.execute('SELECT * FROM screens WHERE id = ?', [screenId]);
    return rows[0];
  }

  // Create new screen
  async createScreen(screenData) {
    const { theater_id, name, capacity, screen_type } = screenData;
    const [result] = await pool.execute(
      'INSERT INTO screens (theater_id, name, capacity, screen_type) VALUES (?, ?, ?, ?)',
      [theater_id, name, capacity, screen_type]
    );
    return result.insertId;
  }

  // Update screen
  async updateScreen(screenId, screenData) {
    const { name, capacity, screen_type } = screenData;
    const [result] = await pool.execute(
      'UPDATE screens SET name = ?, capacity = ?, screen_type = ? WHERE id = ?',
      [name, capacity, screen_type, screenId]
    );
    return result.affectedRows > 0;
  }

  // Delete screen
  async deleteScreen(screenId) {
    const [result] = await pool.execute('DELETE FROM screens WHERE id = ?', [screenId]);
    return result.affectedRows > 0;
  }

  // Get screens by type
  async getScreensByType(screenType) {
    const [rows] = await pool.execute('SELECT * FROM screens WHERE screen_type = ?', [screenType]);
    return rows;
  }

  // Get available screens for a time slot
  async getAvailableScreens(theaterId, date, startTime, endTime) {
    const [rows] = await pool.execute(`
      SELECT s.* FROM screens s
      LEFT JOIN show_times st ON s.id = st.screen_id 
      AND st.start_time < ? AND st.end_time > ?
      WHERE s.theater_id = ? AND st.id IS NULL
    `, [endTime, startTime, theaterId]);
    return rows;
  }
}

module.exports = new ScreenModel();