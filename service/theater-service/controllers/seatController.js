const SeatModel = require('../models/SeatModel');
const ScreenModel = require('../models/ScreenModel');

// Get all seats for a screen
exports.getSeatsByScreenId = async (req, res) => {
  try {
    const screenId = req.params.screenId;
    
    // Verify screen exists
    const screen = await ScreenModel.getScreenById(screenId);
    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }
    
    const seats = await SeatModel.getSeatsByScreenId(screenId);
    res.json(seats);
  } catch (error) {
    console.error('Error in getSeatsByScreenId:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get seat by ID
exports.getSeatById = async (req, res) => {
  try {
    const seatId = req.params.id;
    const seat = await SeatModel.getSeatById(seatId);
    
    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    
    res.json(seat);
  } catch (error) {
    console.error('Error in getSeatById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new seat
// Create new seat
// Create new seat
exports.createSeat = async (req, res) => {
  try {
    const seatData = req.body;
    
    // Validate required fields
    if (!seatData.screen_id || !seatData.row || !seatData.number) {
      return res.status(400).json({ 
        success: false,
        error: 'Screen ID, row, and number are required',
        received: seatData
      });
    }
    
    // Validate data types
    if (isNaN(parseInt(seatData.screen_id, 10))) {
      return res.status(400).json({
        success: false, 
        error: 'Screen ID must be a number',
        received: seatData.screen_id
      });
    }
    
    if (isNaN(parseInt(seatData.number, 10))) {
      return res.status(400).json({ 
        success: false,
        error: 'Seat number must be a number',
        received: seatData.number
      });
    }
    
    // Verify screen exists
    const screen = await ScreenModel.getScreenById(seatData.screen_id);
    if (!screen) {
      return res.status(404).json({ 
        success: false,
        error: 'Screen not found', 
        screen_id: seatData.screen_id 
      });
    }
    
    // Set default seat type if not provided
    if (!seatData.seat_type) {
      seatData.seat_type = 'standard';
    }
    
    // Create the seat
    const seatId = await SeatModel.createSeat(seatData);
    
    // Check if seatId is valid
    if (!seatId) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create seat' 
      });
    }
    
    // Retrieve the created seat
    const seat = await SeatModel.getSeatById(seatId);
    
    // Verify the seat was retrieved successfully
    if (!seat) {
      return res.status(500).json({ 
        success: false,
        error: 'Seat created but could not be retrieved',
        seatId
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Seat created successfully',
      data: seat
    });
  } catch (error) {
    console.error('Error in createSeat:', error.message || error);
    
    // Handle specific errors with appropriate status codes
    if (error.message.includes('already exists')) {
      return res.status(409).json({ 
        success: false,
        error: 'Conflict', 
        details: error.message
      });
    }
    
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        success: false,
        error: 'Not Found', 
        details: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Server error', 
      details: error.message
    });
  }
};

// Update seat
exports.updateSeat = async (req, res) => {
  try {
    const seatId = req.params.id;
    const seatData = req.body;
    
    if (!seatData.row && !seatData.number && !seatData.seat_type) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }
    
    const existingSeat = await SeatModel.getSeatById(seatId);
    if (!existingSeat) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    
    const updatedSeatData = {
      row: seatData.row || existingSeat.row,
      number: seatData.number || existingSeat.number,
      seat_type: seatData.seat_type || existingSeat.seat_type
    };
    
    const updated = await SeatModel.updateSeat(seatId, updatedSeatData);
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update seat' });
    }
    
    const updatedSeat = await SeatModel.getSeatById(seatId);
    res.json(updatedSeat);
  } catch (error) {
    console.error('Error in updateSeat:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete seat
exports.deleteSeat = async (req, res) => {
  try {
    const seatId = req.params.id;
    const seat = await SeatModel.getSeatById(seatId);
    
    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    
    const deleted = await SeatModel.deleteSeat(seatId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete seat' });
    }
    
    res.json({ message: 'Seat deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSeat:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create multiple seats at once
exports.createMultipleSeats = async (req, res) => {
  try {
    const { screen_id, rows, seatsPerRow, seat_type } = req.body;
    
    if (!screen_id || !rows || !seatsPerRow) {
      return res.status(400).json({ error: 'Screen ID, number of rows, and seats per row are required' });
    }
    
    // Verify screen exists
    const screen = await ScreenModel.getScreenById(screen_id);
    if (!screen) {
      return res.status(404).json({ error: 'Screen not found' });
    }
    
    const seatType = seat_type || 'standard';
    const createdCount = await SeatModel.createMultipleSeats(screen_id, rows, seatsPerRow, seatType);
    
    res.status(201).json({ 
      message: `${createdCount} seats created successfully`,
      screen_id,
      rows,
      seatsPerRow,
      seat_type: seatType
    });
  } catch (error) {
    console.error('Error in createMultipleSeats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};