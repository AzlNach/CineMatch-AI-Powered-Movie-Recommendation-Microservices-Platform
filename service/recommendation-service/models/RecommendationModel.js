const pool = require('../config/database');

class RecommendationModel {
  // Save a generated recommendation for a user with training ID
  async saveRecommendation(userId, movieId, score, reason, trainingId = null) {
    const [result] = await pool.execute(
      'INSERT INTO recommendations (user_id, movie_id, score, reason, training_id) VALUES (?, ?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE score = ?, reason = ?, training_id = ?, updated_at = NOW(), is_viewed = FALSE',
      [userId, movieId, score, reason, trainingId, score, reason, trainingId]
    );
    return result.insertId || result.affectedRows > 0;
  }

  // Get stored recommendations for a user
  async getUserRecommendations(userId, limit = 10) {
    const [rows] = await pool.execute(
      'SELECT * FROM recommendations WHERE user_id = ? ORDER BY score DESC, updated_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }

  // Get recommendations by training ID
  async getRecommendationsByTrainingId(trainingId, limit = 100) {
    const [rows] = await pool.execute(
      'SELECT * FROM recommendations WHERE training_id = ? ORDER BY score DESC LIMIT ?',
      [trainingId, limit]
    );
    return rows;
  }

  // Mark a recommendation as viewed
  async markRecommendationAsViewed(id) {
    const [result] = await pool.execute(
      'UPDATE recommendations SET is_viewed = TRUE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Delete a recommendation
  async deleteRecommendation(id) {
    const [result] = await pool.execute(
      'DELETE FROM recommendations WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Delete all recommendations for a user
  async deleteUserRecommendations(userId) {
    const [result] = await pool.execute(
      'DELETE FROM recommendations WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Get recommendations by movie
  async getRecommendationsByMovie(movieId, limit = 50) {
    const [rows] = await pool.execute(
      'SELECT * FROM recommendations WHERE movie_id = ? ORDER BY score DESC LIMIT ?',
      [movieId, limit]
    );
    return rows;
  }

  // Get top recommended movies across all users
  async getTopRecommendedMovies(limit = 10) {
    const [rows] = await pool.execute(`
      SELECT movie_id, COUNT(*) as recommendation_count, AVG(score) as avg_score 
      FROM recommendations 
      GROUP BY movie_id 
      ORDER BY recommendation_count DESC, avg_score DESC 
      LIMIT ?
    `, [limit]);
    return rows;
  }
}

module.exports = new RecommendationModel();