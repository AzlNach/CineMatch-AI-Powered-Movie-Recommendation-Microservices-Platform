let movies = [
  {
    id: 1,
    title: "The Matrix Resurrections",
    description: "Return to the world of The Matrix",
    duration: 148,
    releaseDate: "2023-07-01",
    genres: ["Action", "Sci-Fi"],
    rating: "PG-13",
    posterUrl: "https://example.com/matrix.jpg",
    status: "now-showing"
  },
  {
    id: 2,
    title: "Dune",
    description: "Feature adaptation of Frank Herbert's science fiction novel",
    duration: 155,
    releaseDate: "2023-07-15",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    rating: "PG-13",
    posterUrl: "https://example.com/dune.jpg",
    status: "coming-soon"
  }
];

const genres = ["Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Fantasy"];
const ratings = ["G", "PG", "PG-13", "R", "NC-17"];

// Get all movies
exports.getAllMovies = (req, res) => res.json(movies);

// Get movie by ID
exports.getMovieById = (req, res) => {
  const movie = movies.find(m => m.id == req.params.id);
  movie ? res.json(movie) : res.status(404).json({ error: 'Movie not found' });
};

// Search movies
exports.searchMovies = (req, res) => {
  const { title, genre } = req.query;
  let filteredMovies = [...movies];
  
  if (title) {
    filteredMovies = filteredMovies.filter(m => 
      m.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  
  if (genre) {
    filteredMovies = filteredMovies.filter(m => 
      m.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }
  
  res.json(filteredMovies);
};

// Get now showing movies
exports.getNowShowingMovies = (req, res) => {
  const nowShowing = movies.filter(m => m.status === 'now-showing');
  res.json(nowShowing);
};

// Get coming soon movies
exports.getComingSoonMovies = (req, res) => {
  const comingSoon = movies.filter(m => m.status === 'coming-soon');
  res.json(comingSoon);
};

// Get all genres
exports.getAllGenres = (req, res) => {
  res.json(genres);
};

// Get all ratings
exports.getAllRatings = (req, res) => {
  res.json(ratings);
};

// Add movies
exports.addMovies = (req, res) => {
  const data = req.body;

  if (Array.isArray(data)) {
    const newMovies = data.map((movie, index) => {
      const newMovie = {
        id: movies.length + index + 1,
        title: movie.title,
        description: movie.description || "",
        duration: movie.duration,
        releaseDate: movie.releaseDate,
        genres: movie.genres || [],
        rating: movie.rating,
        posterUrl: movie.posterUrl || "",
        status: movie.status || "coming-soon"
      };
      
      return newMovie;
    });
    
    movies.push(...newMovies);
    res.status(201).json(newMovies);
  } else {
    const { title, description, duration, releaseDate, genres, rating, posterUrl, status } = data;
    
    const newMovie = { 
      id: movies.length + 1, 
      title,
      description: description || "",
      duration,
      releaseDate,
      genres: genres || [],
      rating,
      posterUrl: posterUrl || "",
      status: status || "coming-soon"
    };
    
    movies.push(newMovie);
    res.status(201).json(newMovie);
  }
};

// Update movie
exports.updateMovie = (req, res) => {
  const movieId = parseInt(req.params.id);
  const movieIndex = movies.findIndex(m => m.id === movieId);
  
  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  const { title, description, duration, releaseDate, genres, rating, posterUrl, status } = req.body;
  
  movies[movieIndex] = {
    ...movies[movieIndex],
    ...(title && { title }),
    ...(description && { description }),
    ...(duration && { duration }),
    ...(releaseDate && { releaseDate }),
    ...(genres && { genres }),
    ...(rating && { rating }),
    ...(posterUrl && { posterUrl }),
    ...(status && { status })
  };
  
  res.json(movies[movieIndex]);
};

// Delete movie
exports.deleteMovie = (req, res) => {
  const movieId = parseInt(req.params.id);
  const initialLength = movies.length;
  
  movies = movies.filter(m => m.id !== movieId);
  
  if (movies.length === initialLength) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  
  res.json({ message: 'Movie deleted successfully' });
};