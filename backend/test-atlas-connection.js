import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testAtlasConnection = async () => {
  console.log('🌐 Testing MongoDB Atlas connection...');
  
  if (!process.env.MONGO_URI) {
    console.error('❌ No MONGO_URI found in environment variables');
    console.log('💡 Make sure to update your .env file with your Atlas connection string');
    process.exit(1);
  }
  
  // Check if it's an Atlas connection string
  if (!process.env.MONGO_URI.includes('mongodb+srv://')) {
    console.log('⚠️  This doesn\'t look like an Atlas connection string');
    console.log('💡 Atlas connection strings should start with: mongodb+srv://');
  }
  
  console.log('📍 Attempting to connect to Atlas...');
  
  try {
    // Connect to MongoDB Atlas with additional options
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test basic database operations
    console.log('📊 Atlas connection details:');
    console.log(`   Database name: ${mongoose.connection.name}`);
    console.log(`   Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in Atlas:`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Test a simple query if collections exist
    if (collections.length > 0) {
      console.log('🔍 Testing basic query operations...');
      
      for (const collection of collections) {
        try {
          const count = await mongoose.connection.db.collection(collection.name).countDocuments();
          console.log(`   ${collection.name}: ${count} documents`);
        } catch (error) {
          console.log(`   ${collection.name}: Error counting documents - ${error.message}`);
        }
      }
    } else {
      console.log('📝 Database is empty - you may want to run the seed script');
    }
    
    console.log('🎉 MongoDB Atlas connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('authentication failed')) {
      console.error('   💡 Authentication failed. Check your username and password in the connection string.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   💡 DNS resolution failed. Check your cluster name in the connection string.');
    } else if (error.message.includes('IP not authorized')) {
      console.error('   💡 Your IP address is not authorized. Add your IP to Atlas Network Access.');
    } else if (error.message.includes('bad auth')) {
      console.error('   💡 Bad authentication. Verify your database username and password.');
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Verify your connection string format: mongodb+srv://username:password@cluster.mongodb.net/database');
    console.log('   2. Make sure your database user has proper permissions');
    console.log('   3. Check that your IP is whitelisted in Atlas Network Access');
    console.log('   4. Ensure your cluster is running and accessible');
    
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Atlas connection closed');
    process.exit(0);
  }
};

console.log('🚀 Starting MongoDB Atlas connection test...');
testAtlasConnection();