const MovieModel = require('../models/MovieModel');
const pool = require('../config/database');

// Get all genres
exports.getAllGenres = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM genres ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error in getAllGenres:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get genre by ID
exports.getGenreById = async (req, res) => {
  try {
    const genreId = req.params.id;
    const [rows] = await pool.execute('SELECT * FROM genres WHERE id = ?', [genreId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error in getGenreById:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new genre
exports.createGenre = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Genre name is required' });
    }
    
    // Check if genre already exists
    const [existingRows] = await pool.execute('SELECT id FROM genres WHERE name = ?', [name]);
    
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Genre already exists', id: existingRows[0].id });
    }
    
    const [result] = await pool.execute('INSERT INTO genres (name) VALUES (?)', [name]);
    
    res.status(201).json({
      id: result.insertId,
      name
    });
  } catch (error) {
    console.error('Error in createGenre:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update genre
exports.updateGenre = async (req, res) => {
  try {
    const genreId = req.params.id;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Genre name is required' });
    }
    
    // Check if genre exists
    const [existingRows] = await pool.execute('SELECT id FROM genres WHERE id = ?', [genreId]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    // Check if new name already exists for another genre
    const [duplicateRows] = await pool.execute(
      'SELECT id FROM genres WHERE name = ? AND id != ?', 
      [name, genreId]
    );
    
    if (duplicateRows.length > 0) {
      return res.status(400).json({ error: 'Another genre with this name already exists' });
    }
    
    const [result] = await pool.execute(
      'UPDATE genres SET name = ? WHERE id = ?',
      [name, genreId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to update genre' });
    }
    
    res.json({
      id: parseInt(genreId),
      name
    });
  } catch (error) {
    console.error('Error in updateGenre:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete genre
exports.deleteGenre = async (req, res) => {
  try {
    const genreId = req.params.id;
    
    // Check if genre exists
    const [existingRows] = await pool.execute('SELECT id FROM genres WHERE id = ?', [genreId]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    // Check if genre is used by any movies
    const [usageRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM movie_genres WHERE genre_id = ?',
      [genreId]
    );
    
    if (usageRows[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete genre that is in use by movies',
        moviesCount: usageRows[0].count 
      });
    }
    
    const [result] = await pool.execute('DELETE FROM genres WHERE id = ?', [genreId]);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'Failed to delete genre' });
    }
    
    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error('Error in deleteGenre:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get movies for a genre
exports.getMoviesByGenre = async (req, res) => {
  try {
    const genreId = req.params.id;
    
    // Check if genre exists
    const [genreRows] = await pool.execute('SELECT * FROM genres WHERE id = ?', [genreId]);
    
    if (genreRows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    const [rows] = await pool.execute(`
      SELECT m.* FROM movies m
      JOIN movie_genres mg ON m.id = mg.movie_id
      WHERE mg.genre_id = ?
      ORDER BY m.title
    `, [genreId]);
    
    // For each movie, get all its genres
    const moviesWithGenres = await Promise.all(rows.map(async (movie) => {
      const genres = await MovieModel.getGenresForMovie(movie.id);
      return { ...movie, genres };
    }));
    
    res.json({
      genre: genreRows[0],
      movies: moviesWithGenres
    });
  } catch (error) {
    console.error('Error in getMoviesByGenre:', error);
    res.status(500).json({ error: 'Server error' });
  }
};