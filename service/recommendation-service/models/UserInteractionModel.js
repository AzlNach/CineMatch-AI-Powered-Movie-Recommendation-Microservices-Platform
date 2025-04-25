const pool = require('../config/database');

class UserInteractionModel {
  // Record a user interaction with a movie
  async recordInteraction(interactionData) {
    const {
      user_id,
      movie_id,
      booking_id,
      review_id,
      interaction_type,
      rating
    } = interactionData;
    
    const [result] = await pool.execute(
      'INSERT INTO user_interactions (user_id, movie_id, booking_id, review_id, interaction_type, rating) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, movie_id, booking_id || null, review_id || null, interaction_type, rating || null]
    );
    
    return result.insertId;
  }

  // Get recent interactions (for the last n days)
  async getRecentInteractions(days = 30, limit = 1000) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_interactions WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY timestamp DESC LIMIT ?',
      [days, limit]
    );
    return rows;
  }

  // Get interactions by user ID
  async getUserInteractions(userId, limit = 100) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_interactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }

  // Get interactions by movie ID
  async getMovieInteractions(movieId, limit = 100) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_interactions WHERE movie_id = ? ORDER BY timestamp DESC LIMIT ?',
      [movieId, limit]
    );
    return rows;
  }

  // Get interactions by type
  async getInteractionsByType(type, limit = 100) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_interactions WHERE interaction_type = ? ORDER BY timestamp DESC LIMIT ?',
      [type, limit]
    );
    return rows;
  }

  // Get rating interactions
  async getRatingInteractions(limit = 100) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_interactions WHERE interaction_type = "rating" AND rating IS NOT NULL ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    return rows;
  }
}

module.exports = new UserInteractionModel();