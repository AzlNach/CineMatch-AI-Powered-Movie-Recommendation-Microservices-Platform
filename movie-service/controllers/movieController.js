let movies = [];

exports.getAllMovies = (req, res) => res.json(movies);
exports.getMovieById = (req, res) => {
  const movie = movies.find(m => m.id == req.params.id);
  movie ? res.json(movie) : res.status(404).json({ error: 'Movie not found' });
};



exports.addMovies = (req, res) => {
  const data = req.body;

  if (Array.isArray(data)) {
    const newMovies = data.map((movie, index) => {
      const newMovie = {
        id: movies.length + index + 1,
        title: movie.title,
        schedule: movie.schedule
      };
      movies.push(newMovie);
      return newMovie;
    });
    res.status(201).json(newMovies);
  } else {
    const { title, schedule } = data;
    const newMovie = { id: movies.length + 1, title, schedule };
    movies.push(newMovie);
    res.status(201).json(newMovie);
  }
};




// exports.addMovie = (req, res) => {
//   const { title, schedule } = req.body;
//   const newMovie = { id: movies.length + 1, title, schedule };
//   movies.push(newMovie);

//   res.status(201).json(newMovie);
// };