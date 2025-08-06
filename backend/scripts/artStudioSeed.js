import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Artwork from '../models/Artwork.js';
import Comment from '../models/Comment.js';

dotenv.config();

const seedArtStudio = async () => {
  try {
    console.log('🎨 Starting Art Studio database seeding...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/artstudio';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Artwork.deleteMany({});
    await Comment.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create sample users (artists)
    const users = [
      {
        username: 'artmaster',
        email: 'artmaster@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        firstName: 'Alex',
        lastName: 'Rivera',
        bio: 'Digital artist specializing in abstract and surreal artwork. Love experimenting with colors and forms.',
        isVerified: true,
        artworksCount: 0,
        likesReceived: 0
      },
      {
        username: 'pixelpainter',
        email: 'pixel@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        firstName: 'Maya',
        lastName: 'Chen',
        bio: 'Pixel art enthusiast and digital illustrator. Creating retro-inspired art with modern twists.',
        isVerified: true,
        artworksCount: 0,
        likesReceived: 0
      },
      {
        username: 'colorwhisper',
        email: 'colorwhisper@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        firstName: 'Jordan',
        lastName: 'Smith',
        bio: 'Contemporary digital artist exploring the intersection of technology and nature.',
        isVerified: true,
        artworksCount: 0,
        likesReceived: 0
      },
      {
        username: 'dreamweaver',
        email: 'dreamweaver@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        firstName: 'Sam',
        lastName: 'Johnson',
        bio: 'Fantasy and sci-fi digital artist. Bringing imaginary worlds to life through digital art.',
        isVerified: true,
        artworksCount: 0,
        likesReceived: 0
      },
      {
        username: 'minimalist',
        email: 'minimal@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user',
        firstName: 'Taylor',
        lastName: 'Brown',
        bio: 'Minimalist artist focused on clean lines, geometric shapes, and negative space.',
        isVerified: true,
        artworksCount: 0,
        likesReceived: 0
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        bio: 'Platform administrator',
        isVerified: true,
        artworksCount: 0,
        likesReceived: 0
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create sample artworks
    const sampleCanvasData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const artworks = [
      {
        title: 'Sunset Dreams',
        description: 'A vibrant digital painting capturing the essence of a perfect sunset with warm colors and flowing forms.',
        imageUrl: '/uploads/artworks/sample1.png',
        canvasData: sampleCanvasData,
        tags: ['sunset', 'abstract', 'warm', 'digital'],
        artist: createdUsers[0]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 25,
        isPublic: true,
        featured: true,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#FF6B35', '#F7931E', '#FFD23F', '#EE4B2B']
      },
      {
        title: 'Pixel Adventure',
        description: 'Retro-style pixel art depicting a heroic character on an epic journey through mystical lands.',
        imageUrl: '/uploads/artworks/sample2.png',
        canvasData: sampleCanvasData,
        tags: ['pixel', 'retro', 'adventure', 'character'],
        artist: createdUsers[1]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 42,
        isPublic: true,
        featured: true,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#8B4513', '#32CD32', '#4169E1', '#FFD700']
      },
      {
        title: 'Nature\'s Harmony',
        description: 'A serene composition blending organic shapes with digital textures, representing the balance between nature and technology.',
        imageUrl: '/uploads/artworks/sample3.png',
        canvasData: sampleCanvasData,
        tags: ['nature', 'harmony', 'organic', 'technology'],
        artist: createdUsers[2]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 18,
        isPublic: true,
        featured: false,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#228B22', '#87CEEB', '#8FBC8F', '#F0E68C']
      },
      {
        title: 'Cosmic Wanderer',
        description: 'A sci-fi inspired artwork featuring a lone explorer in a vast cosmic landscape filled with stars and nebulae.',
        imageUrl: '/uploads/artworks/sample4.png',
        canvasData: sampleCanvasData,
        tags: ['sci-fi', 'space', 'cosmic', 'explorer'],
        artist: createdUsers[3]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 67,
        isPublic: true,
        featured: true,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#191970', '#4B0082', '#9400D3', '#FF1493']
      },
      {
        title: 'Geometric Serenity',
        description: 'Clean, minimalist composition using geometric shapes and a monochromatic palette to create a sense of calm.',
        imageUrl: '/uploads/artworks/sample5.png',
        canvasData: sampleCanvasData,
        tags: ['minimal', 'geometric', 'clean', 'monochrome'],
        artist: createdUsers[4]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 31,
        isPublic: true,
        featured: false,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#000000', '#FFFFFF', '#808080', '#C0C0C0']
      },
      {
        title: 'Digital Bloom',
        description: 'Abstract floral patterns created with digital brushes, exploring the beauty of algorithmic art.',
        imageUrl: '/uploads/artworks/sample6.png',
        canvasData: sampleCanvasData,
        tags: ['abstract', 'floral', 'algorithmic', 'bloom'],
        artist: createdUsers[0]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 15,
        isPublic: true,
        featured: false,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#FF69B4', '#DA70D6', '#BA55D3', '#9370DB']
      },
      {
        title: 'Urban Pulse',
        description: 'Dynamic cityscape with neon colors and flowing lines, capturing the energy of modern urban life.',
        imageUrl: '/uploads/artworks/sample7.png',
        canvasData: sampleCanvasData,
        tags: ['urban', 'neon', 'city', 'dynamic'],
        artist: createdUsers[1]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 53,
        isPublic: true,
        featured: true,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00']
      },
      {
        title: 'Ethereal Waves',
        description: 'Flowing, wave-like forms in soft pastels that evoke a sense of tranquility and movement.',
        imageUrl: '/uploads/artworks/sample8.png',
        canvasData: sampleCanvasData,
        tags: ['ethereal', 'waves', 'pastel', 'tranquil'],
        artist: createdUsers[2]._id,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        views: 29,
        isPublic: true,
        featured: false,
        dimensions: { width: 800, height: 600 },
        tools: ['brush'],
        colors: ['#FFB6C1', '#E6E6FA', '#F0F8FF', '#F5FFFA']
      }
    ];

    const createdArtworks = await Artwork.insertMany(artworks);
    console.log(`🎨 Created ${createdArtworks.length} artworks`);

    // Create sample comments
    const comments = [
      {
        content: 'Absolutely stunning! The color palette is incredible.',
        author: createdUsers[1]._id,
        artwork: createdArtworks[0]._id,
        likes: [createdUsers[2]._id, createdUsers[3]._id],
        likesCount: 2
      },
      {
        content: 'Love the retro vibe! Takes me back to classic video games.',
        author: createdUsers[0]._id,
        artwork: createdArtworks[1]._id,
        likes: [createdUsers[2]._id],
        likesCount: 1
      },
      {
        content: 'The balance between nature and technology is beautifully executed.',
        author: createdUsers[3]._id,
        artwork: createdArtworks[2]._id,
        likes: [],
        likesCount: 0
      },
      {
        content: 'This makes me want to explore the cosmos! Amazing work.',
        author: createdUsers[4]._id,
        artwork: createdArtworks[3]._id,
        likes: [createdUsers[0]._id, createdUsers[1]._id],
        likesCount: 2
      },
      {
        content: 'Such elegant simplicity. Less is definitely more here.',
        author: createdUsers[0]._id,
        artwork: createdArtworks[4]._id,
        likes: [createdUsers[3]._id],
        likesCount: 1
      },
      {
        content: 'The algorithmic patterns are mesmerizing!',
        author: createdUsers[2]._id,
        artwork: createdArtworks[5]._id,
        likes: [],
        likesCount: 0
      },
      {
        content: 'Captures the urban energy perfectly. Love the neon colors!',
        author: createdUsers[3]._id,
        artwork: createdArtworks[6]._id,
        likes: [createdUsers[0]._id, createdUsers[4]._id],
        likesCount: 2
      },
      {
        content: 'So peaceful and calming. Beautiful work!',
        author: createdUsers[1]._id,
        artwork: createdArtworks[7]._id,
        likes: [createdUsers[2]._id],
        likesCount: 1
      }
    ];

    const createdComments = await Comment.insertMany(comments);
    console.log(`💬 Created ${createdComments.length} comments`);

    // Update artwork comment counts
    for (let i = 0; i < createdArtworks.length; i++) {
      const commentCount = comments.filter(comment => 
        comment.artwork.toString() === createdArtworks[i]._id.toString()
      ).length;
      
      await Artwork.findByIdAndUpdate(createdArtworks[i]._id, {
        commentsCount: commentCount
      });
    }

    // Add some likes to artworks
    const artworkLikes = [
      { artworkId: createdArtworks[0]._id, likes: [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id] },
      { artworkId: createdArtworks[1]._id, likes: [createdUsers[0]._id, createdUsers[2]._id] },
      { artworkId: createdArtworks[2]._id, likes: [createdUsers[3]._id] },
      { artworkId: createdArtworks[3]._id, likes: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[4]._id] },
      { artworkId: createdArtworks[4]._id, likes: [createdUsers[2]._id] },
      { artworkId: createdArtworks[5]._id, likes: [createdUsers[1]._id, createdUsers[3]._id] },
      { artworkId: createdArtworks[6]._id, likes: [createdUsers[0]._id, createdUsers[2]._id, createdUsers[4]._id] },
      { artworkId: createdArtworks[7]._id, likes: [createdUsers[1]._id] }
    ];

    for (const artworkLike of artworkLikes) {
      const likes = artworkLike.likes.map(userId => ({
        user: userId,
        type: 'like',
        createdAt: new Date()
      }));

      await Artwork.findByIdAndUpdate(artworkLike.artworkId, {
        likes: likes,
        likesReceived: likes.length
      });
    }

    // Update user artwork counts and likes received
    for (const user of createdUsers) {
      const artworkCount = createdArtworks.filter(artwork => 
        artwork.artist.toString() === user._id.toString()
      ).length;
      
      let totalLikes = 0;
      for (const artwork of createdArtworks) {
        if (artwork.artist.toString() === user._id.toString()) {
          const artworkLike = artworkLikes.find(al => al.artworkId.toString() === artwork._id.toString());
          if (artworkLike) {
            totalLikes += artworkLike.likes.length;
          }
        }
      }

      await User.findByIdAndUpdate(user._id, {
        artworksCount: artworkCount,
        likesReceived: totalLikes
      });
    }

    // Add some follow relationships
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { following: { $each: [createdUsers[1]._id, createdUsers[2]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { followers: createdUsers[0]._id, following: createdUsers[3]._id }
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { followers: createdUsers[0]._id, following: { $each: [createdUsers[3]._id, createdUsers[4]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      $push: { followers: { $each: [createdUsers[1]._id, createdUsers[2]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      $push: { followers: createdUsers[2]._id }
    });

    console.log('✅ Art Studio seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   🎨 Artworks: ${createdArtworks.length}`);
    console.log(`   💬 Comments: ${createdComments.length}`);
    console.log('\n🔐 Test Accounts:');
    console.log('   • artmaster@example.com / password123');
    console.log('   • pixel@example.com / password123');
    console.log('   • colorwhisper@example.com / password123');
    console.log('   • dreamweaver@example.com / password123');
    console.log('   • minimal@example.com / password123');
    console.log('   • admin@example.com / admin123 (Admin)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

seedArtStudio();