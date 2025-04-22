// Utility functions for analyzing user and movie data

// Analyze trends to find currently popular movies
function analyzeTrends(movies, interactions) {
    // Count recent interactions by movie
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentInteractions = interactions.filter(
      interaction => new Date(interaction.timestamp) >= oneWeekAgo
    );
    
    // Count interactions per movie
    const movieCounts = countInteractionsByMovie(recentInteractions);
    
    // Calculate trending scores
    return movies
      .map(movie => ({
        ...movie,
        trendingScore: calculateTrendingScore(movie, movieCounts, recentInteractions),
        interactionCount: movieCounts[movie.id] || 0
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 5);
  }
  
  // Helper function to count interactions by movie
  function countInteractionsByMovie(interactions) {
    const counts = {};
    
    interactions.forEach(interaction => {
      const { movieId } = interaction;
      counts[movieId] = (counts[movieId] || 0) + 1;
    });
    
    return counts;
  }
  
  // Calculate a trending score based on recency and volume
  function calculateTrendingScore(movie, interactionCounts, recentInteractions) {
    const count = interactionCounts[movie.id] || 0;
    
    // Factor in recency by giving more weight to very recent interactions
    const veryRecentInteractions = recentInteractions
      .filter(i => i.movieId === movie.id && isVeryRecent(i.timestamp));
    
    const recencyBonus = veryRecentInteractions.length * 0.5;
    
    return count + recencyBonus;
  }
  
  // Check if an interaction is very recent (last 24 hours)
  function isVeryRecent(timestamp) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return new Date(timestamp) >= oneDayAgo;
  }
  
  module.exports = {
    analyzeTrends
  };