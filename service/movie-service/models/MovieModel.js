const pool = require('../config/database');

class MovieModel {
  // Get all movies
  async getAllMovies() {
    const [rows] = await pool.execute('SELECT * FROM movies ORDER BY title');
    
    // Fetch genres for each movie
    for (const movie of rows) {
      movie.genres = await this.getGenresForMovie(movie.id);
    }
    
    return rows;
  }

  // Get movie by ID
  async getMovieById(movieId) {
    // Get movie details
    const [movieRows] = await pool.execute('SELECT * FROM movies WHERE id = ?', [movieId]);
    
    if (movieRows.length === 0) {
      return null;
    }
    
    const movie = movieRows[0];
    
    // Get genres for the movie
    movie.genres = await this.getGenresForMovie(movieId);
    
    return movie;
  }

  // Get genres for a specific movie
  async getGenresForMovie(movieId) {
    const [rows] = await pool.execute(`
      SELECT g.id, g.name 
      FROM genres g
      JOIN movie_genres mg ON g.id = mg.genre_id
      WHERE mg.movie_id = ?
      ORDER BY g.name
    `, [movieId]);
    
    return rows;
  }

  // Create new movie
  async createMovie(movieData) {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert movie basic details
      const [result] = await connection.execute(
        'INSERT INTO movies (title, synopsis, release_date, duration, director, cast, poster_url, trailer_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          movieData.title,
          movieData.synopsis || null,
          movieData.release_date || null,
          movieData.duration || null,
          movieData.director || null,
          movieData.cast || null,
          movieData.poster_url || null,
          movieData.trailer_url || null,
          movieData.rating || 0.0
        ]
      );
      
      const movieId = result.insertId;
      
      // Insert genres if provided
      if (movieData.genres && Array.isArray(movieData.genres)) {
        for (const genreName of movieData.genres) {
          // Check if genre exists, create if not
          let genreId = await this.getOrCreateGenre(connection, genreName);
          
          // Add movie-genre relationship
          await connection.execute(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
            [movieId, genreId]
          );
        }
      }
      
      await connection.commit();
      return movieId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get genre by name or create if not exists
  async getOrCreateGenre(connection, genreName) {
    // Try to find existing genre
    const [rows] = await connection.execute(
      'SELECT id FROM genres WHERE name = ?',
      [genreName]
    );
    
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // Create new genre if it doesn't exist
    const [result] = await connection.execute(
      'INSERT INTO genres (name) VALUES (?)',
      [genreName]
    );
    
    return result.insertId;
  }

  // Update movie
  async updateMovie(movieId, movieData) {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update movie basic details
      const [result] = await connection.execute(
        'UPDATE movies SET title = ?, synopsis = ?, release_date = ?, duration = ?, director = ?, cast = ?, poster_url = ?, trailer_url = ?, rating = ? WHERE id = ?',
        [
          movieData.title,
          movieData.synopsis || null,
          movieData.release_date || null,
          movieData.duration || null,
          movieData.director || null,
          movieData.cast || null,
          movieData.poster_url || null,
          movieData.trailer_url || null,
          movieData.rating || 0.0,
          movieId
        ]
      );
      
      // Update genres if provided
      if (movieData.genres && Array.isArray(movieData.genres)) {
        // Delete existing genre associations
        await connection.execute(
          'DELETE FROM movie_genres WHERE movie_id = ?',
          [movieId]
        );
        
        // Add new genre associations
        for (const genreName of movieData.genres) {
          // Check if genre exists, create if not
          let genreId = await this.getOrCreateGenre(connection, genreName);
          
          // Add movie-genre relationship
          await connection.execute(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
            [movieId, genreId]
          );
        }
      }
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Delete movie
  async deleteMovie(movieId) {
    const [result] = await pool.execute('DELETE FROM movies WHERE id = ?', [movieId]);
    return result.affectedRows > 0;
  }

  // Search movies
  async searchMovies(query) {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      'SELECT * FROM movies WHERE title LIKE ? OR synopsis LIKE ? OR director LIKE ? OR cast LIKE ?',
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
    
    // Fetch genres for each movie
    for (const movie of rows) {
      movie.genres = await this.getGenresForMovie(movie.id);
    }
    
    return rows;
  }

  // Get movies by genre
  async getMoviesByGenre(genreName) {
    const [rows] = await pool.execute(`
      SELECT m.* FROM movies m
      JOIN movie_genres mg ON m.id = mg.movie_id
      JOIN genres g ON mg.genre_id = g.id
      WHERE g.name = ?
      ORDER BY m.title
    `, [genreName]);
    
    // Fetch all genres for each movie
    for (const movie of rows) {
      movie.genres = await this.getGenresForMovie(movie.id);
    }
    
    return rows;
  }

  // Add movie review
  async addReview(movieId, userId, rating, comment) {
    // Insert the review
    const [result] = await pool.execute(
      'INSERT INTO movie_reviews (movie_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [movieId, userId, rating, comment || null]
    );
    
    // Update the average rating in the movies table
    await this.updateMovieRating(movieId);
    
    return result.insertId;
  }

  // Get reviews for a movie
  async getMovieReviews(movieId) {
    const [rows] = await pool.execute(
      'SELECT * FROM movie_reviews WHERE movie_id = ? ORDER BY created_at DESC',
      [movieId]
    );
    return rows;
  }

  // Update movie average rating
  async updateMovieRating(movieId) {
    const [rows] = await pool.execute(
      'SELECT AVG(rating) as avg_rating FROM movie_reviews WHERE movie_id = ?',
      [movieId]
    );
    const avgRating = rows[0].avg_rating || 0;
    
    await pool.execute(
      'UPDATE movies SET rating = ? WHERE id = ?',
      [avgRating, movieId]
    );
    return avgRating;
  }

  // Get top rated movies
  async getTopRatedMovies(limit = 10) {
    const [rows] = await pool.execute(
      'SELECT * FROM movies ORDER BY rating DESC LIMIT ?',
      [limit]
    );
    
    // Fetch genres for each movie
    for (const movie of rows) {
      movie.genres = await this.getGenresForMovie(movie.id);
    }
    
    return rows;
  }

  // Get new releases (movies released in the last 30 days)
  async getNewReleases() {
    const [rows] = await pool.execute(`
      SELECT * FROM movies 
      WHERE release_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY release_date DESC
    `);
    
    // Fetch genres for each movie
    for (const movie of rows) {
      movie.genres = await this.getGenresForMovie(movie.id);
    }
    
    return rows;
  }

  // Get upcoming movies (movies with release dates in the future)
  async getUpcomingMovies() {
    const [rows] = await pool.execute(`
      SELECT * FROM movies 
      WHERE release_date > CURDATE()
      ORDER BY release_date ASC
    `);
    
    // Fetch genres for each movie
    for (const movie of rows) {
      movie.genres = await this.getGenresForMovie(movie.id);
    }
    
    return rows;
  }

  // Get all genres
  async getAllGenres() {
    const [rows] = await pool.execute('SELECT * FROM genres ORDER BY name');
    return rows;
  }

  // Save a movie recommendation
  async saveRecommendation(userId, movieId, score) {
    const [result] = await pool.execute(
      'INSERT INTO movie_recommendations (user_id, movie_id, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = ?, created_at = NOW()',
      [userId, movieId, score, score]
    );
    return result.insertId || result.affectedRows > 0;
  }

  // Get recommendations for a user
  async getUserRecommendations(userId, limit = 10) {
    const [rows] = await pool.execute(`
      SELECT m.*, mr.score 
      FROM movie_recommendations mr
      JOIN movies m ON mr.movie_id = m.id
      WHERE mr.user_id = ?
      ORDER BY mr.score DESC
      LIMIT ?
    `, [userId, limit]);
    
    // Fetch genres for each movie
    for (const movie of rows) {
      movie.genres = await this.getGenresForMovie(movie.id);
    }
    
    return rows;
  }
}

module.exports = new MovieModel();