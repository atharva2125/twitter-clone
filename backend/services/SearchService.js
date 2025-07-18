const Tweet = require('../models/Tweet');
const User = require('../models/User');

class SearchService {
  static async searchTweets(query, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Perform a basic text search
      const tweets = await Tweet.find({
        $text: { $search: query }
      })
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error searching tweets: ${error.message}`);
    }
  }

  static async searchUsers(query, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Perform a basic text search
      const users = await User.find({
        $text: { $search: query }
      })
        .select('username displayName avatar verified bio')
        .skip(skip)
        .limit(limit);

      return users;
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  }
}

module.exports = SearchService;

