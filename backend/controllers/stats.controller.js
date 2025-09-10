import User from '../models/User.js';
import Artwork from '../models/Artwork.js';

// Get platform statistics
export const getPlatformStats = async (req, res) => {
  try {
    // Get artworks count from active users
    const artworksCount = await Artwork.countDocuments({
      artist: { $in: await User.find({ isActive: true }).distinct('_id') }
    });

    // Get active artists count
    const activeArtistsCount = await User.countDocuments({ 
      isActive: true,
      artworksCount: { $gt: 0 }
    });

    // Get likes count from active users
    const likesCount = await Artwork.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'likes.user',
          foreignField: '_id',
          as: 'activeLikers'
        }
      },
      {
        $addFields: {
          activeLikes: {
            $size: {
              $filter: {
                input: '$activeLikers',
                as: 'liker',
                cond: { $eq: ['$$liker.isActive', true] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$activeLikes' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        artworksCount,
        activeArtistsCount,
        likesCount: likesCount[0]?.totalLikes || 0
      }
    });
  } catch (error) {
    console.error('Error getting platform stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform statistics' 
    });
  }
};
