const TheaterModel = require('../models/TheaterModel');
const ScreenModel = require('../models/ScreenModel');


// Get all theaters
exports.getAllTheaters = async (req, res) => {
  try {
    const theaters = await TheaterModel.getAllTheaters();
    res.json(theaters);
  } catch (error) {
    console.error('Error in getAllTheaters:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get theater by ID
exports.getTheaterById = async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await TheaterModel.getTheaterById(theaterId);
    
    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    res.json(theater);
  } catch (error) {
    console.error('Error in getTheaterById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new theater
exports.createTheater = async (req, res) => {
  try {
    const theaterData = req.body;
    
    if (!theaterData.name || !theaterData.location || !theaterData.address) {
      return res.status(400).json({ error: 'Name, location, and address are required' });
    }
    
    // Set default value for total_screens if not provided
    if (!theaterData.total_screens) {
      theaterData.total_screens = 1;
    }
    
    const theaterId = await TheaterModel.createTheater(theaterData);
    const theater = await TheaterModel.getTheaterById(theaterId);
    
    res.status(201).json(theater);
  } catch (error) {
    console.error('Error in createTheater:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update theater
exports.updateTheater = async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theaterData = req.body;
    
    if (!theaterData.name && !theaterData.location && !theaterData.address && !theaterData.total_screens) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }
    
    // Get current theater data to fill in missing fields
    const existingTheater = await TheaterModel.getTheaterById(theaterId);
    
    if (!existingTheater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    const updatedTheaterData = {
      name: theaterData.name || existingTheater.name,
      location: theaterData.location || existingTheater.location,
      address: theaterData.address || existingTheater.address,
      total_screens: theaterData.total_screens || existingTheater.total_screens
    };
    
    const updated = await TheaterModel.updateTheater(theaterId, updatedTheaterData);
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update theater' });
    }
    
    const updatedTheater = await TheaterModel.getTheaterById(theaterId);
    res.json(updatedTheater);
  } catch (error) {
    console.error('Error in updateTheater:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete theater
exports.deleteTheater = async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await TheaterModel.getTheaterById(theaterId);
    
    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    const deleted = await TheaterModel.deleteTheater(theaterId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete theater' });
    }
    
    res.json({ message: 'Theater deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTheater:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get theaters by location
exports.getTheatersByLocation = async (req, res) => {
  try {
    const location = req.params.location;
    const theaters = await TheaterModel.getTheatersByLocation(location);
    res.json(theaters);
  } catch (error) {
    console.error('Error in getTheatersByLocation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get screens for a theater
exports.getTheaterScreens = async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await TheaterModel.getTheaterById(theaterId);
    
    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    const screens = await ScreenModel.getScreensByTheaterId(theaterId);
    res.json(screens);
  } catch (error) {
    console.error('Error in getTheaterScreens:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get showtimes for a theater
exports.getTheaterShowTimes = async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await TheaterModel.getTheaterById(theaterId);
    
    if (!theater) {
      return res.status(404).json({ error: 'Theater not found' });
    }
    
    try {
      // Call the schedule service
      const response = await axios.get(`http://localhost:3004/schedules/theater/${theaterId}`);
      res.json(response.data);
    } catch (err) {
      console.error('Error fetching showtimes from schedule service:', err);
      res.status(500).json({ error: 'Error fetching showtimes' });
    }
  } catch (error) {
    console.error('Error in getTheaterShowTimes:', error);
    res.status(500).json({ error: 'Server error' });
  }
};