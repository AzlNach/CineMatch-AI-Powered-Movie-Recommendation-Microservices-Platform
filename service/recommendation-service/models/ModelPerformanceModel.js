const pool = require('../config/database');

class ModelPerformanceModel {
  // Record model performance metrics
  async recordPerformance(performanceData) {
    const { 
      model_version, 
      accuracy, 
      precision_score, 
      recall, 
      f1_score, 
      training_time, 
      parameters,
      notes 
    } = performanceData;
    
    const [result] = await pool.execute(
      'INSERT INTO model_performance (model_version, accuracy, precision_score, recall, f1_score, training_time, parameters, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        model_version, 
        accuracy || null, 
        precision_score || null, 
        recall || null, 
        f1_score || null, 
        training_time || null, 
        parameters ? JSON.stringify(parameters) : null,
        notes || null
      ]
    );
    
    return result.insertId;
  }

  // Update model performance metrics
  async updatePerformance(modelId, updateData) {
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'parameters' && value) {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      return false;
    }
    
    values.push(modelId);
    
    const [result] = await pool.execute(
      `UPDATE model_performance SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Get latest model performance
  async getLatestPerformance() {
    const [rows] = await pool.execute(
      'SELECT * FROM model_performance ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length > 0 && rows[0].parameters) {
      try {
        rows[0].parameters = JSON.parse(rows[0].parameters);
      } catch (e) {
        console.error('Error parsing parameters JSON:', e);
      }
    }
    
    return rows[0] || null;
  }

  // Get performance by model version
  async getPerformanceByVersion(modelVersion) {
    const [rows] = await pool.execute(
      'SELECT * FROM model_performance WHERE model_version = ? ORDER BY created_at DESC',
      [modelVersion]
    );
    
    rows.forEach(row => {
      if (row.parameters) {
        try {
          row.parameters = JSON.parse(row.parameters);
        } catch (e) {
          console.error('Error parsing parameters JSON:', e);
        }
      }
    });
    
    return rows;
  }

  // Get model by ID
  async getModelById(modelId) {
    const [rows] = await pool.execute(
      'SELECT * FROM model_performance WHERE id = ?',
      [modelId]
    );
    
    if (rows.length > 0 && rows[0].parameters) {
      try {
        rows[0].parameters = JSON.parse(rows[0].parameters);
      } catch (e) {
        console.error('Error parsing parameters JSON:', e);
      }
    }
    
    return rows[0] || null;
  }

  // Get all performance records
  async getAllPerformanceRecords(limit = 100) {
    const [rows] = await pool.execute(
      'SELECT * FROM model_performance ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    
    rows.forEach(row => {
      if (row.parameters) {
        try {
          row.parameters = JSON.parse(row.parameters);
        } catch (e) {
          console.error('Error parsing parameters JSON:', e);
        }
      }
    });
    
    return rows;
  }
}

module.exports = new ModelPerformanceModel();