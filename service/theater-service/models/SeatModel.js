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

  // Modified createSeat method with better error handling and SQL syntax
// Modified createSeat method with better error handling and SQL syntax
async createSeat(seatData) {
  const { screen_id, row, number, seat_type } = seatData;
  console.log('Creating seat with data:', { screen_id, row, number, seat_type });
  
  try {
    // Ensure all required parameters are properly typed
    const screenId = parseInt(screen_id, 10);
    const seatNumber = parseInt(number, 10);
    const seatRow = String(row).toUpperCase();
    const type = seat_type || 'standard';
    
    // First check if seat already exists with a simple query
    const [existingSeats] = await pool.execute(
      'SELECT id FROM seats WHERE screen_id = ? AND `row` = ? AND number = ?',
      [screenId, seatRow, seatNumber]
    );
    
    if (existingSeats && existingSeats.length > 0) {
      throw new Error(`Seat already exists at screen ${screenId}, row ${seatRow}, number ${seatNumber}`);
    }
    
    // Insert the seat with a simple query
    const [result] = await pool.execute(
      'INSERT INTO seats (screen_id, `row`, number, seat_type) VALUES (?, ?, ?, ?)',
      [screenId, seatRow, seatNumber, type]
    );
    
    console.log('Insert result:', result);
    return result.insertId;
  } catch (error) {
    console.error('Database error in createSeat:', error);
    
    // Check for specific MySQL error codes
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error(`Seat already exists at row ${row}, number ${number} for screen ${screen_id}`);
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new Error(`Screen with ID ${screen_id} does not exist`);
    }
    
    throw error;
  }
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