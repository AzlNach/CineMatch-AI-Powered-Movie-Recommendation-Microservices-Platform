// In-memory storage for schedules
let schedules = [
  {
    id: 1,
    movieId: 1,
    theaterId: 1,
    startTime: '2023-07-10T10:00:00Z',
    endTime: '2023-07-10T12:30:00Z',
    price: 50000
  },
  {
    id: 2,
    movieId: 1,
    theaterId: 1,
    startTime: '2023-07-10T13:00:00Z',
    endTime: '2023-07-10T15:30:00Z',
    price: 50000
  },
  {
    id: 3,
    movieId: 2,
    theaterId: 2,
    startTime: '2023-07-10T10:30:00Z',
    endTime: '2023-07-10T12:45:00Z',
    price: 45000
  }
];

// Get all schedules
exports.getAllSchedules = (req, res) => {
  res.json(schedules);
};

// Get schedule by ID
exports.getScheduleById = (req, res) => {
  const schedule = schedules.find(s => s.id == req.params.id);
  
  if (schedule) {
    res.json(schedule);
  } else {
    res.status(404).json({ error: 'Schedule not found' });
  }
};

// Get schedules by movie ID
exports.getSchedulesByMovie = (req, res) => {
  const movieId = parseInt(req.params.movieId);
  const movieSchedules = schedules.filter(s => s.movieId === movieId);
  
  res.json(movieSchedules);
};

// Get schedules by date
exports.getSchedulesByDate = (req, res) => {
  const dateParam = req.params.date; // Expected format: YYYY-MM-DD
  
  const dateSchedules = schedules.filter(s => {
    const scheduleDate = new Date(s.startTime).toISOString().split('T')[0];
    return scheduleDate === dateParam;
  });
  
  res.json(dateSchedules);
};

// Create new schedule
exports.createSchedule = (req, res) => {
  const { movieId, theaterId, startTime, endTime, price } = req.body;
  
  // Validate required fields
  if (!movieId || !theaterId || !startTime || !endTime || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newSchedule = {
    id: schedules.length + 1,
    movieId: parseInt(movieId),
    theaterId: parseInt(theaterId),
    startTime,
    endTime,
    price: parseFloat(price)
  };
  
  schedules.push(newSchedule);
  res.status(201).json(newSchedule);
};

// Update schedule
exports.updateSchedule = (req, res) => {
  const scheduleId = parseInt(req.params.id);
  const { movieId, theaterId, startTime, endTime, price } = req.body;
  
  const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
  
  if (scheduleIndex === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  
  const updatedSchedule = {
    ...schedules[scheduleIndex],
    ...(movieId && { movieId: parseInt(movieId) }),
    ...(theaterId && { theaterId: parseInt(theaterId) }),
    ...(startTime && { startTime }),
    ...(endTime && { endTime }),
    ...(price && { price: parseFloat(price) })
  };
  
  schedules[scheduleIndex] = updatedSchedule;
  res.json(updatedSchedule);
};

// Delete schedule
exports.deleteSchedule = (req, res) => {
  const scheduleId = parseInt(req.params.id);
  const initialLength = schedules.length;
  
  schedules = schedules.filter(s => s.id !== scheduleId);
  
  if (schedules.length === initialLength) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  
  res.json({ message: 'Schedule deleted successfully' });
};