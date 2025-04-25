const pool = require('../config/database');

class TheaterModel {
  // Get all theaters
  async getAllTheaters() {
    const [rows] = await pool.execute('SELECT * FROM theaters');
    return rows;
  }

  // Get theater by ID
  async getTheaterById(theaterId) {
    const [rows] = await pool.execute('SELECT * FROM theaters WHERE id = ?', [theaterId]);
    return rows[0];
  }

  // Create new theater
  async createTheater(theaterData) {
    const { name, location, address, total_screens } = theaterData;
    const [result] = await pool.execute(
      'INSERT INTO theaters (name, location, address, total_screens) VALUES (?, ?, ?, ?)',
      [name, location, address, total_screens]
    );
    return result.insertId;
  }

  // Update theater
  async updateTheater(theaterId, theaterData) {
    const { name, location, address, total_screens } = theaterData;
    const [result] = await pool.execute(
      'UPDATE theaters SET name = ?, location = ?, address = ?, total_screens = ? WHERE id = ?',
      [name, location, address, total_screens, theaterId]
    );
    return result.affectedRows > 0;
  }

  // Delete theater
  async deleteTheater(theaterId) {
    const [result] = await pool.execute('DELETE FROM theaters WHERE id = ?', [theaterId]);
    return result.affectedRows > 0;
  }

  // Get theaters by location
  async getTheatersByLocation(location) {
    const [rows] = await pool.execute('SELECT * FROM theaters WHERE location = ?', [location]);
    return rows;
  }

  // Get theaters with available screens
  async getTheatersWithAvailableScreens(date, time) {
    const [rows] = await pool.execute(`
      SELECT DISTINCT t.* FROM theaters t
      JOIN screens s ON t.id = s.theater_id
      LEFT JOIN show_times st ON s.id = st.screen_id AND DATE(st.start_time) = ?
      WHERE st.id IS NULL OR TIME(st.start_time) != ?
    `, [date, time]);
    return rows;
  }
}

module.exports = new TheaterModel();