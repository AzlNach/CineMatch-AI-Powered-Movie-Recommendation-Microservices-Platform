const userModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

// Helper function to generate a random token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Calculate expiry date (24 hours from now)
function getExpiryDate() {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  return date;
}

// Register new user
exports.register = async (req, res) => {
  try {
    const userData = req.body;

    // If data is an array, add all users
    if (Array.isArray(userData)) {
      const newUsers = [];
      for (const user of userData) {
        // Check if user already exists
        const existingUser = await userModel.getUserByUsername(user.username);
        if (existingUser) {
          return res.status(400).json({ error: `Username ${user.username} already taken` });
        }

        const existingEmail = await userModel.getUserByEmail(user.email);
        if (existingEmail) {
          return res.status(400).json({ error: `Email ${user.email} already registered` });
        }

        const userId = await userModel.createUser({
          username: user.username,
          password: user.password,
          email: user.email,
          name: user.name || user.username
        });
        
        const newUser = await userModel.getUserById(userId);
        newUsers.push(newUser);
      }
      res.status(201).json(newUsers);
    } else {
      // If data is a single object, add one user
      const { username, password, email, name } = userData;
      
      if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password and email are required' });
      }

      // Check if user already exists
      const existingUser = await userModel.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const existingEmail = await userModel.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const userId = await userModel.createUser({
        username,
        password,
        email,
        name: name || username
      });
      
      const newUser = await userModel.getUserById(userId);
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user from database
    const user = await userModel.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token and session
    const token = generateToken();
    const expiryDate = getExpiryDate();
    
    await userModel.createSession(user.id, token, expiryDate);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      token, 
      user: userWithoutPassword,
      expiresAt: expiryDate
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// User logout
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    const success = await userModel.deleteSession(token);
    
    if (!success) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const session = await userModel.getSessionByToken(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { name, email } = req.body;
    
    if (!name && !email) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    
    const user = await userModel.getUserById(session.user_id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingEmail = await userModel.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }
    
    const updated = await userModel.updateUser(session.user_id, {
      name: name || user.name,
      email: email || user.email
    });
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    const updatedUser = await userModel.getUserById(session.user_id);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user password
// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const session = await userModel.getSessionByToken(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // First get the user by ID from session
    const user = await userModel.getUserById(session.user_id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if password exists in the user object
    if (!user.password) {
      return res.status(500).json({ error: 'User password data is missing' });
    }
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const updated = await userModel.updatePassword(session.user_id, hashedPassword);
    
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update password' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const session = await userModel.getSessionByToken(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Delete all sessions for the user
    await userModel.deleteUserSessions(session.user_id);
    
    // Delete the user
    const deleted = await userModel.deleteUser(session.user_id);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete account' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user history (integration with booking service)
exports.getUserHistory = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const session = await userModel.getSessionByToken(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real app, fetch user history from other services via API calls
    // For now, return dummy data
    res.json({
      userId: session.user_id,
      activities: [
        { type: 'login', timestamp: new Date().toISOString() },
        { type: 'viewed_movie', movieId: 1, timestamp: new Date().toISOString() }
      ]
    });
  } catch (error) {
    console.error('Error in getUserHistory:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user bookings (integration with booking service)
exports.getUserBookings = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const session = await userModel.getSessionByToken(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real app, call the booking service API to get bookings
    // For now, return dummy data
    res.json({
      userId: session.user_id,
      bookings: []
    });
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user by ID (internal microservice use)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};