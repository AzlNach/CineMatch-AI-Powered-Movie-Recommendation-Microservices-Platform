const pool = require('../config/database');

class SeatModel {
  // Get all seats for a screen
  async getSeatsByScreenId(screenId) {
    const [rows] = await pool.execute('SELECT * FROM seats WHERE screen_id = ?', [screenId]);
    return rows;
  }

  // Get seat by ID
  async getSeatById(seatId) {
    const [rows] = await pool.execute('SELECT * FROM seats WHERE id = ?', [seatId]);
    return rows[0];
  }

  // Create new seat
  async createSeat(seatData) {
    const { screen_id, row, number, seat_type } = seatData;
    const [result] = await pool.execute(
      'INSERT INTO seats (screen_id, row, number, seat_type) VALUES (?, ?, ?, ?)',
      [screen_id, row, number, seat_type]
    );
    return result.insertId;
  }

  // Update seat
  async updateSeat(seatId, seatData) {
    const { row, number, seat_type } = seatData;
    const [result] = await pool.execute(
      'UPDATE seats SET `row` = ?, number = ?, seat_type = ? WHERE id = ?',
      [row, number, seat_type, seatId]
    );
    return result.affectedRows > 0;
  }

  // Delete seat
  async deleteSeat(seatId) {
    const [result] = await pool.execute('DELETE FROM seats WHERE id = ?', [seatId]);
    return result.affectedRows > 0;
  }

  // Create multiple seats at once
  async createMultipleSeats(screenId, rows, seatsPerRow, seatType = 'standard') {
    const values = [];
    const placeholders = [];
    
    for (let i = 0; i < rows; i++) {
      const rowLetter = String.fromCharCode(65 + i); // A, B, C, ...
      for (let j = 1; j <= seatsPerRow; j++) {
        values.push(screenId, rowLetter, j, seatType);
        placeholders.push('(?, ?, ?, ?)');
      }
    }
    
    const [result] = await pool.execute(
      `INSERT INTO seats (screen_id, \`row\`, number, seat_type) VALUES ${placeholders.join(', ')}`,
      values
    );
    
    return result.affectedRows;
  }

  // Get seats by type
  async getSeatsByType(screenId, seatType) {
    const [rows] = await pool.execute(
      'SELECT * FROM seats WHERE screen_id = ? AND seat_type = ?',
      [screenId, seatType]
    );
    return rows;
  }
}

module.exports = new SeatModel();