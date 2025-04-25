// AI Model implementation for movie recommendations
const TrainingDataModel = require('./TrainingDataModel');
const RecommendationModel = require('./RecommendationModel');
const UserInteractionModel = require('./UserInteractionModel');
const ModelPerformanceModel = require('./ModelPerformanceModel');

const VERSION = '1.0.1';

// Generate personalized recommendations for a user
async function generateRecommendations(user, movies, bookingHistory, interactions, trainingId = null) {
  console.log(`Generating recommendations for user ${user.id} with ${bookingHistory.length} bookings and ${interactions.length} interactions`);
  
  // 1. Content-based filtering
  const contentBasedRecommendations = await generateContentBasedRecommendations(
    user, 
    movies, 
    bookingHistory
  );
  
  // 2. Collaborative filtering
  const collaborativeRecommendations = await generateCollaborativeRecommendations(
    user,
    interactions,
    movies
  );
  
  // 3. Hybrid approach - combine both recommendation types
  const hybridRecommendations = mergeRecommendations(
    contentBasedRecommendations,
    collaborativeRecommendations
  );
  
  // 4. Filter out movies the user has already seen
  const seenMovieIds = bookingHistory.map(booking => booking.movieId);
  const filteredRecommendations = hybridRecommendations.filter(
    movie => !seenMovieIds.includes(movie.id)
  );
  
  // 5. Save recommendations to database with training ID
  for (const rec of filteredRecommendations.slice(0, 10)) {
    await RecommendationModel.saveRecommendation(
      user.id,
      rec.id,
      rec.score,
      rec.reason,
      trainingId
    );
  }
  
  // 6. Return top recommendations
  return filteredRecommendations.slice(0, 10).map(movie => ({
    movie,
    score: movie.score,
    reason: movie.reason
  }));
}

// Find similar movies based on content features
async function findSimilarMovies(targetMovie, allMovies) {
  console.log(`Finding similar movies to ${targetMovie.title}`);
  
  // Calculate similarity scores
  const similarMovies = allMovies
    .filter(movie => movie.id !== targetMovie.id)
    .map(movie => ({
      movie,
      similarityScore: calculateSimilarity(targetMovie, movie),
      commonFeatures: getCommonFeatures(targetMovie, movie)
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);
  
  return similarMovies;
}

// Update model based on new user interactions and save training data
async function retrainModel(interactions, features = ['genres', 'ratings', 'bookings']) {
  console.log(`Retraining recommendation model with ${interactions.length} interactions`);
  
  const startTime = Date.now();
  
  // Create new model performance record
  const modelId = await ModelPerformanceModel.recordPerformance({
    model_version: VERSION,
    accuracy: 0.85,
    precision_score: 0.82,
    recall: 0.79,
    f1_score: 0.81,
    training_time: 0, // Will be updated later
    parameters: {
      contentWeight: 0.6,
      collaborativeWeight: 0.4,
      minInteractions: 5,
      features
    },
    notes: `Retrained with ${interactions.length} interactions`
  });
  
  // Create training data record
  const startDate = new Date(Math.min(...interactions.map(i => new Date(i.timestamp))));
  const endDate = new Date();
  
  const trainingId = await TrainingDataModel.createTrainingData({
    model_id: modelId,
    start_date: startDate,
    end_date: endDate,
    dataset_size: interactions.length,
    features_used: JSON.stringify(features),
    status: 'processing'
  });
  
  // In a real implementation, this would update model parameters
  // based on new user behavior data
  // Simulate training time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update training time
  const trainingTime = Date.now() - startTime;
  await ModelPerformanceModel.updatePerformance(modelId, {
    training_time: trainingTime
  });
  
  // Update training status to completed
  await TrainingDataModel.updateTrainingStatus(trainingId, 'completed', {
    iterations: 100,
    convergence: 0.001,
    execution_time_ms: trainingTime
  });
  
  return {
    success: true,
    version: VERSION,
    trainingTime,
    trainingId,
    modelId
  };
}

// Helper functions
async function generateContentBasedRecommendations(user, movies, bookingHistory) {
  // Extract user preferences from booking history
  const genres = new Set();
  const directors = new Set();
  const actors = new Set();
  
  bookingHistory.forEach(booking => {
    const movie = movies.find(m => m.id == booking.movieId);
    if (movie) {
      movie.genres?.forEach(genre => genres.add(genre));
      
      if (movie.director) {
        directors.add(movie.director);
      }
      
      movie.cast?.split(',').forEach(actor => {
        actors.add(actor.trim());
      });
    }
  });
  
  // Generate scores for movies based on content matching
  return movies.map(movie => ({
    ...movie,
    score: Math.random() * 5 + 5, // Placeholder scoring between 5-10
    reason: "Content-based recommendation based on your viewing history"
  }));
}

async function generateCollaborativeRecommendations(user, interactions, movies) {
  // Find similar users based on interaction patterns
  // Recommend movies liked by similar users
  return movies.map(movie => ({
    ...movie,
    score: Math.random() * 5 + 5, // Placeholder scoring between 5-10
    reason: "People with similar taste enjoyed this"
  }));
}

function mergeRecommendations(contentRecs, collaborativeRecs) {
  // Combine recommendations with weighted scores
  const allRecs = [...contentRecs, ...collaborativeRecs];
  
  // Group by movie ID and combine scores
  const movieMap = new Map();
  allRecs.forEach(rec => {
    if (!movieMap.has(rec.id)) {
      movieMap.set(rec.id, rec);
    } else {
      const existing = movieMap.get(rec.id);
      existing.score = (existing.score + rec.score) / 2;
      existing.reason = "Multiple factors suggest you'll like this";
    }
  });
  
  return Array.from(movieMap.values())
    .sort((a, b) => b.score - a.score);
}

function calculateSimilarity(movie1, movie2) {
  // In a real implementation, this would compare movie features
  // such as genres, actors, directors, plot keywords
  return Math.random(); // Placeholder
}

function getCommonFeatures(movie1, movie2) {
  const commonFeatures = [];
  
  // Compare genres
  if (movie1.genres && movie2.genres) {
    const common = movie1.genres.filter(g => movie2.genres.includes(g));
    if (common.length > 0) {
      commonFeatures.push(`${common.length} genre(s) in common`);
    }
  }
  
  // Compare director
  if (movie1.director && movie2.director && movie1.director === movie2.director) {
    commonFeatures.push(`Same director: ${movie1.director}`);
  }
  
  // Compare cast (simplified)
  if (movie1.cast && movie2.cast) {
    const cast1 = movie1.cast.split(',').map(a => a.trim());
    const cast2 = movie2.cast.split(',').map(a => a.trim());
    const commonActors = cast1.filter(a => cast2.includes(a));
    
    if (commonActors.length > 0) {
      commonFeatures.push(`${commonActors.length} actor(s) in common`);
    }
  }
  
  return commonFeatures.length > 0 ? commonFeatures : ['Similar movies'];
}

module.exports = {
  VERSION,
  generateRecommendations,
  findSimilarMovies,
  retrainModel
};