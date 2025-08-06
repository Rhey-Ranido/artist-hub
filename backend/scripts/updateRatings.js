import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import Provider from '../models/Provider.js';

dotenv.config();

const updateAllRatings = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📊 Updating all service ratings...');
    const serviceResults = await Service.updateAllRatingStats();
    console.log(`✅ Updated ${serviceResults.length} service ratings`);

    console.log('📊 Updating all provider ratings...');
    const providerResults = await Provider.updateAllRatingStats();
    console.log(`✅ Updated ${providerResults.length} provider ratings`);

    console.log('\n📈 Summary:');
    console.log(`Services updated: ${serviceResults.length}`);
    console.log(`Providers updated: ${providerResults.length}`);

    // Log some sample results
    if (serviceResults.length > 0) {
      console.log('\n📋 Sample service ratings:');
      serviceResults.slice(0, 3).forEach(result => {
        console.log(`  Service ${result.serviceId}: ${result.average.toFixed(1)}⭐ (${result.count} reviews)`);
      });
    }

    if (providerResults.length > 0) {
      console.log('\n📋 Sample provider ratings:');
      providerResults.slice(0, 3).forEach(result => {
        console.log(`  Provider ${result.providerId}: ${result.average.toFixed(1)}⭐ (${result.count} reviews)`);
      });
    }

  } catch (error) {
    console.error('❌ Error updating ratings:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the update if this script is executed directly
console.log('🚀 Starting rating update script...');
updateAllRatings();

export default updateAllRatings; 