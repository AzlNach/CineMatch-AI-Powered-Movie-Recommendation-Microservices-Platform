const pool = require('../config/database');

class UserPreferenceModel {
  // Save user preference
  async savePreference(userId, preferenceType, preferenceValue, weight = 1.0) {
    const [result] = await pool.execute(
      'INSERT INTO user_preferences (user_id, preference_type, preference_value, weight) VALUES (?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE weight = ?, updated_at = NOW()',
      [userId, preferenceType, preferenceValue, weight, weight]
    );
    return result.insertId || result.affectedRows > 0;
  }

  // Get all preferences for a user
  async getUserPreferences(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_preferences WHERE user_id = ? ORDER BY preference_type, weight DESC',
      [userId]
    );
    return rows;
  }

  // Get specific preference type for a user
  async getUserPreferencesByType(userId, preferenceType) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_preferences WHERE user_id = ? AND preference_type = ? ORDER BY weight DESC',
      [userId, preferenceType]
    );
    return rows;
  }

  // Update preference weight
  async updatePreferenceWeight(userId, preferenceType, preferenceValue, weight) {
    const [result] = await pool.execute(
      'UPDATE user_preferences SET weight = ?, updated_at = NOW() WHERE user_id = ? AND preference_type = ? AND preference_value = ?',
      [weight, userId, preferenceType, preferenceValue]
    );
    return result.affectedRows > 0;
  }

  // Delete a user preference
  async deletePreference(userId, preferenceType, preferenceValue) {
    const [result] = await pool.execute(
      'DELETE FROM user_preferences WHERE user_id = ? AND preference_type = ? AND preference_value = ?',
      [userId, preferenceType, preferenceValue]
    );
    return result.affectedRows > 0;
  }

  // Delete all preferences for a user
  async deleteAllUserPreferences(userId) {
    const [result] = await pool.execute(
      'DELETE FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Get users with similar preferences
  async getSimilarUsers(userId, limit = 20) {
    // This query finds users who have similar preferences to the given user
    const [rows] = await pool.execute(`
      SELECT up2.user_id, COUNT(*) as matching_preferences, SUM(up2.weight) as total_weight
      FROM user_preferences up1
      JOIN user_preferences up2 ON up1.preference_type = up2.preference_type 
                                AND up1.preference_value = up2.preference_value
      WHERE up1.user_id = ? AND up2.user_id != ?
      GROUP BY up2.user_id
      ORDER BY matching_preferences DESC, total_weight DESC
      LIMIT ?
    `, [userId, userId, limit]);
    
    return rows;
  }

  // Get popular preferences by type
  async getPopularPreferences(preferenceType, limit = 10) {
    const [rows] = await pool.execute(`
      SELECT preference_value, COUNT(*) as user_count, AVG(weight) as avg_weight
      FROM user_preferences
      WHERE preference_type = ?
      GROUP BY preference_value
      ORDER BY user_count DESC, avg_weight DESC
      LIMIT ?
    `, [preferenceType, limit]);
    
    return rows;
  }
}

module.exports = new UserPreferenceModel();