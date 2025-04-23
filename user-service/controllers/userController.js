const users = [];
let userSessions = [];

// Register new user
exports.register = (req, res) => {
  const userData = req.body;

  // If data is an array, add all users
  if (Array.isArray(userData)) {
    const newUsers = userData.map((user, index) => ({
      id: users.length + index + 1,
      username: user.username,
      password: user.password, // In a real app, this should be hashed
      email: user.email,
      name: user.name || user.username,
      createdAt: new Date().toISOString()
    }));

    users.push(...newUsers);
    res.status(201).json(newUsers);
  } else {
    // If data is a single object, add one user
    const { username, password, email, name } = userData;
    const newUser = {
      id: users.length + 1,
      username,
      password, // In a real app, this should be hashed
      email,
      name: name || username,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    res.status(201).json(newUser);
  }
};

// User login
exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Create a session token
    const token = generateToken();
    userSessions.push({
      userId: user.id,
      token,
      createdAt: new Date().toISOString()
    });

    // Return token and user data (exclude password)
    const { password, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// User logout
exports.logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }
  
  // Remove session
  const initialLength = userSessions.length;
  userSessions = userSessions.filter(session => session.token !== token);
  
  if (userSessions.length === initialLength) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.json({ message: 'Logged out successfully' });
};

// Update user profile
exports.updateProfile = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const session = userSessions.find(s => s.token === token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { name, email } = req.body;
  const userIndex = users.findIndex(u => u.id === session.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    updatedAt: new Date().toISOString()
  };
  
  // Return updated user (exclude password)
  const { password, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
};

// Update user password
exports.updatePassword = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const session = userSessions.find(s => s.token === token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { currentPassword, newPassword } = req.body;
  const userIndex = users.findIndex(u => u.id === session.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Verify current password
  if (users[userIndex].password !== currentPassword) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  
  // Update password
  users[userIndex].password = newPassword;
  users[userIndex].updatedAt = new Date().toISOString();
  
  res.json({ message: 'Password updated successfully' });
};

// Delete user account
exports.deleteAccount = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const session = userSessions.find(s => s.token === token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userIndex = users.findIndex(u => u.id === session.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Remove user
  users.splice(userIndex, 1);
  
  // Remove all sessions for the user
  userSessions = userSessions.filter(s => s.userId !== session.userId);
  
  res.json({ message: 'Account deleted successfully' });
};

// Get user history
exports.getUserHistory = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const session = userSessions.find(s => s.token === token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // In a real app, fetch user history from database or other services
  res.json({
    userId: session.userId,
    activities: [
      { type: 'login', timestamp: new Date().toISOString() },
      { type: 'viewed_movie', movieId: 1, timestamp: new Date().toISOString() }
    ]
  });
};

// Get user bookings
exports.getUserBookings = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const session = userSessions.find(s => s.token === token);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // In a real app, this would call the booking service to get bookings
  res.json({
    userId: session.userId,
    bookings: []
  });
};

// Get user by ID
exports.getUserById = (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (user) {
    // Exclude password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
};

// Helper function to generate a random token
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}