const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Create a new user
  async createUser(userData) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, email, name, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userData.username, hashedPassword, userData.email, userData.name]
    );
    return result.insertId;
  }

  // Get user by ID
  async getUserById(userId) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0];
  }

  // Get user by username (including password for authentication)
  async getUserByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Get user by email
  async getUserByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Update user profile
  async updateUser(userId, userData) {
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [userData.name, userData.email, userId]
    );
    return result.affectedRows > 0;
  }

  // Update user password
  async updatePassword(userId, hashedPassword) {
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  // Delete user
  async deleteUser(userId) {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Create a new session
  async createSession(userId, token, expiresAt) {
    const [result] = await pool.execute(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return result.insertId;
  }

  // Get session by token
  async getSessionByToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  }

  // Delete session (logout)
  async deleteSession(token) {
    const [result] = await pool.execute(
      'DELETE FROM user_sessions WHERE token = ?',
      [token]
    );
    return result.affectedRows > 0;
  }

  // Delete all sessions for a user
  async deleteUserSessions(userId) {
    const [result] = await pool.execute(
      'DELETE FROM user_sessions WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new UserModel();