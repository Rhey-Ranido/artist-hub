import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artwork from '../models/Artwork.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

dotenv.config();

const recalcAllCounts = async () => {
  const summary = { artworksUpdated: 0, commentsUpdated: 0, usersUpdated: 0 };
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1) Recalculate Artwork counts from source-of-truth collections
    console.log('📊 Recalculating artwork likesCount and commentsCount...');
    const artworks = await Artwork.find({}).select('_id likes artist');
    for (const artwork of artworks) {
      const likesCount = Array.isArray(artwork.likes) ? artwork.likes.length : 0;
      const commentsCount = await Comment.countDocuments({ artwork: artwork._id });
      await Artwork.updateOne({ _id: artwork._id }, { $set: { likesCount, commentsCount } });
      summary.artworksUpdated += 1;
    }

    // 2) Recalculate Comment likesCount based on likes array length
    console.log('📊 Recalculating comment likesCount...');
    const comments = await Comment.find({}).select('_id likes');
    for (const comment of comments) {
      const likesCount = Array.isArray(comment.likes) ? comment.likes.length : 0;
      await Comment.updateOne({ _id: comment._id }, { $set: { likesCount } });
      summary.commentsUpdated += 1;
    }

    // 3) Recalculate User artworksCount and likesReceived
    console.log('📊 Recalculating user artworksCount and likesReceived...');
    const users = await User.find({}).select('_id');
    for (const user of users) {
      const artworksByUser = await Artwork.find({ artist: user._id }).select('likes');
      const artworksCount = artworksByUser.length;
      const likesReceived = artworksByUser.reduce((sum, a) => sum + (Array.isArray(a.likes) ? a.likes.length : 0), 0);
      await User.updateOne({ _id: user._id }, { $set: { artworksCount, likesReceived } });
      summary.usersUpdated += 1;
    }

    console.log('✅ Sync complete');
    console.log('📈 Summary:', summary);
  } catch (err) {
    console.error('❌ Error during sync:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
  return summary;
};

// Execute when run directly
if (process.argv[1] && process.argv[1].includes('syncCounts.js')) {
  console.log('🚀 Starting counts sync script...');
  recalcAllCounts();
}

export default recalcAllCounts;


