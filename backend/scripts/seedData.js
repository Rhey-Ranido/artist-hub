import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Service from '../models/Service.js';
import ServiceReview from '../models/ServiceReview.js';
import ProviderReview from '../models/ProviderReview.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Provider.deleteMany({});
    await Service.deleteMany({});
    await ServiceReview.deleteMany({});
    await ProviderReview.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create sample users based on friends' data
    const users = [
      {
        email: 'jerson.caibog@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'provider',
        firstName: 'Jerson',
        lastName: 'Caibog',
        isVerified: true
      },
      {
        email: 'ivan.yakit@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'provider',
        firstName: 'Ivan',
        lastName: 'Yakit',
        isVerified: true
      },
      {
        email: 'aina.oprin@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'provider',
        firstName: 'Aina',
        lastName: 'Oprin',
        isVerified: true
      },
      {
        email: 'jemerson.daganio@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'provider',
        firstName: 'Jemerson',
        lastName: 'Daganio',
        isVerified: true
      },
      {
        email: 'rhey.ranido@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'provider',
        firstName: 'Rhey',
        lastName: 'Ranido',
        isVerified: true
      },
      {
        email: 'marvin.opriassa@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'provider',
        firstName: 'Marvin',
        lastName: 'Opriassa',
        isVerified: true
      },
      {
        email: 'client@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'client',
        firstName: 'Test',
        lastName: 'Client',
        isVerified: true
      },
      {
        email: 'sarah.johnson@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'client',
        firstName: 'Sarah',
        lastName: 'Johnson',
        isVerified: true
      },
      {
        email: 'michael.chen@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'client',
        firstName: 'Michael',
        lastName: 'Chen',
        isVerified: true
      },
      {
        email: 'emma.rodriguez@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'client',
        firstName: 'Emma',
        lastName: 'Rodriguez',
        isVerified: true
      },
      {
        email: 'david.kim@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'client',
        firstName: 'David',
        lastName: 'Kim',
        isVerified: true
      },
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isVerified: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Created users');

    // Central location coordinates (your actual location)
    const centralLat = 11.026151751966875;
    const centralLng = 125.73439786974755;
    
    // Generate nearby coordinates (within 1.5km radius)
    const generateNearbyCoordinates = (baseLat, baseLng, maxDistanceKm = 1.5) => {
      const latOffset = (Math.random() - 0.5) * (maxDistanceKm / 111); // 1 degree ≈ 111 km
      const lngOffset = (Math.random() - 0.5) * (maxDistanceKm / (111 * Math.cos(baseLat * Math.PI / 180)));
      return [baseLng + lngOffset, baseLat + latOffset];
    };

    // Create providers based on friends' data
    const providers = [
      {
        userId: createdUsers[0]._id,
        name: 'Jerson Caibog',
        bio: 'Professional web developer with expertise in modern web technologies. Specialized in creating responsive, user-friendly websites and web applications.',
        location: {
          address: 'Tacloban City, Leyte',
          type: 'Point',
          coordinates: generateNearbyCoordinates(centralLat, centralLng, 0.3)
        },
        rating: {
          average: 4.8,
          count: 24
        },
        totalReviews: 24,
        totalServices: 1,
        isVerified: true,
        status: 'approved',
        categories: ['Technology'],
        skills: ['Web Development', 'JavaScript', 'React', 'Node.js', 'HTML/CSS'],
        languages: ['English', 'Filipino'],
        responseTime: 'within 2 hours',
        completedProjects: 156,
        socialLinks: {
          website: 'https://jersonweb.dev',
          linkedin: 'https://linkedin.com/in/jersoncaibog',
          github: 'https://github.com/jersoncaibog'
        }
      },
      {
        userId: createdUsers[1]._id,
        name: 'Ivan Yakit',
        bio: 'Professional video editor with years of experience in creating compelling visual content. Specialized in video editing, post-production, and motion graphics.',
        location: {
          address: 'Tacloban City, Leyte',
          type: 'Point',
          coordinates: generateNearbyCoordinates(centralLat, centralLng, 0.6)
        },
        rating: {
          average: 4.9,
          count: 31
        },
        totalReviews: 31,
        totalServices: 1,
        isVerified: true,
        status: 'approved',
        categories: ['Design'],
        skills: ['Video Editing', 'Adobe Premiere Pro', 'After Effects', 'Motion Graphics', 'Color Grading'],
        languages: ['English', 'Filipino'],
        responseTime: 'within 4 hours',
        completedProjects: 89,
        socialLinks: {
          website: 'https://ivanyakit.com',
          linkedin: 'https://linkedin.com/in/ivanyakit'
        }
      },
      {
        userId: createdUsers[2]._id,
        name: 'Aina Oprin',
        bio: 'Professional content writer and copywriter with expertise in creating engaging, SEO-optimized content for various platforms and industries.',
        location: {
          address: 'Tacloban City, Leyte',
          type: 'Point',
          coordinates: generateNearbyCoordinates(centralLat, centralLng, 0.9)
        },
        rating: {
          average: 0,
          count: 0
        },
        totalReviews: 0,
        totalServices: 1,
        isVerified: true,
        status: 'approved',
        categories: ['Writing'],
        skills: ['Content Writing', 'Copywriting', 'SEO Writing', 'Blog Writing', 'Technical Writing'],
        languages: ['English', 'Filipino'],
        responseTime: 'within 6 hours',
        completedProjects: 67,
        socialLinks: {
          website: 'https://ainawrites.com'
        }
      },
      {
        userId: createdUsers[3]._id,
        name: 'Jemerson Daganio',
        bio: 'Professional beauty and wellness specialist offering salon and spa services. Specialized in hair styling, beauty treatments, and wellness services.',
        location: {
          address: 'Tacloban City, Leyte',
          type: 'Point',
          coordinates: generateNearbyCoordinates(centralLat, centralLng, 1.2)
        },
        rating: {
          average: 0,
          count: 0
        },
        totalReviews: 0,
        totalServices: 1,
        isVerified: true,
        status: 'approved',
        categories: ['Other'],
        skills: ['Hair Styling', 'Beauty Treatments', 'Spa Services', 'Wellness', 'Customer Service'],
        languages: ['English', 'Filipino'],
        responseTime: 'within 3 hours',
        completedProjects: 234,
        socialLinks: {
          website: 'https://jemersonbeauty.com'
        }
      },
      {
        userId: createdUsers[4]._id,
        name: 'Rhey Ranido',
        bio: 'Board game enthusiast and organizer offering game nights, tournaments, and custom board game experiences for events and gatherings.',
        location: {
          address: 'Tacloban City, Leyte',
          type: 'Point',
          coordinates: generateNearbyCoordinates(centralLat, centralLng, 0.8)
        },
        rating: {
          average: 0,
          count: 0
        },
        totalReviews: 0,
        totalServices: 1,
        isVerified: true,
        status: 'approved',
        categories: ['Other'],
        skills: ['Board Games', 'Event Planning', 'Game Master', 'Tournament Organization', 'Entertainment'],
        languages: ['English', 'Filipino'],
        responseTime: 'within 12 hours',
        completedProjects: 145,
        socialLinks: {
          website: 'https://rheygames.com'
        }
      },
      {
        userId: createdUsers[5]._id,
        name: 'Marvin Opriassa',
        bio: 'Professional piggery and livestock management specialist with years of experience in sustainable farming practices and animal care.',
        location: {
          address: 'Tacloban City, Leyte',
          type: 'Point',
          coordinates: generateNearbyCoordinates(centralLat, centralLng, 1.4)
        },
        rating: {
          average: 0,
          count: 0
        },
        totalReviews: 0,
        totalServices: 1,
        isVerified: true,
        status: 'approved',
        categories: ['Business'],
        skills: ['Piggery Management', 'Livestock Care', 'Sustainable Farming', 'Animal Health', 'Business Planning'],
        languages: ['English', 'Filipino'],
        responseTime: 'within 8 hours',
        completedProjects: 78,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/marvinopriassa'
        }
      }
    ];

    const createdProviders = await Provider.insertMany(providers);
    console.log('🏢 Created providers');

    // Create services based on friends' hobbies
    const services = [
      {
        providerId: createdProviders[0]._id,
        title: 'Professional Web Development Services',
        description: 'I will create custom websites and web applications tailored to your business needs using modern technologies like React, Node.js, and responsive design. This service includes full-stack development, database integration, and deployment.',
        shortDescription: 'Custom website development with modern technologies including React, Node.js, and responsive design.',
        price: {
          amount: 150,
          unit: 'hour'
        },
        category: 'Technology',
        tags: ['Web Development', 'React', 'Node.js', 'Responsive', 'Full-stack'],
        images: [],
        featured: true,
        deliveryTime: '1-2 weeks',
        revisions: 3,
        requirements: ['Project requirements document', 'Brand guidelines (if available)', 'Content and images'],
        faqs: [
          {
            question: 'Do you provide hosting?',
            answer: 'I can help you set up hosting on platforms like Netlify, Vercel, or AWS, but hosting costs are separate.'
          },
          {
            question: 'Will the website be mobile-friendly?',
            answer: 'Yes, all websites I create are fully responsive and optimized for mobile devices.'
          }
        ],
        rating: {
          average: 0,
          count: 0
        },
        totalOrders: 156,
        packages: [
          {
            name: 'Basic',
            description: 'Simple landing page with up to 3 sections',
            price: 800,
            deliveryTime: '5-7 days',
            revisions: 2,
            features: ['Responsive design', 'Contact form', 'SEO basics']
          },
          {
            name: 'Standard',
            description: 'Multi-page website with CMS integration',
            price: 1500,
            deliveryTime: '1-2 weeks',
            revisions: 3,
            features: ['Up to 5 pages', 'CMS integration', 'Advanced SEO', 'Analytics setup']
          },
          {
            name: 'Premium',
            description: 'Full-featured web application',
            price: 3000,
            deliveryTime: '2-3 weeks',
            revisions: 5,
            features: ['Custom functionality', 'Database integration', 'User authentication', 'Admin panel']
          }
        ]
      },
      {
        providerId: createdProviders[1]._id,
        title: 'Professional Video Editing & Post-Production',
        description: 'High-quality video editing services for commercials, social media content, YouTube videos, and corporate presentations. Includes color grading, motion graphics, and special effects.',
        shortDescription: 'Professional video editing services for commercials, social media, and corporate content with advanced post-production.',
        price: {
          amount: 120,
          unit: 'hour'
        },
        category: 'Design',
        tags: ['Video Editing', 'Post-Production', 'Motion Graphics', 'Color Grading', 'Adobe Premiere'],
        images: [],
        featured: true,
        deliveryTime: '3-5 days',
        revisions: 2,
        requirements: ['Raw video footage', 'Project brief and style preferences', 'Brand guidelines'],
        faqs: [
          {
            question: 'What video formats do you work with?',
            answer: 'I work with all major video formats including MP4, MOV, AVI, and can export in any format you need.'
          },
          {
            question: 'Do you provide music and sound effects?',
            answer: 'I can suggest royalty-free music and sound effects, or you can provide your own audio files.'
          }
        ],
        rating: {
          average: 0,
          count: 0
        },
        totalOrders: 89,
        packages: [
          {
            name: 'Basic Edit',
            description: 'Simple video editing with basic transitions',
            price: 200,
            deliveryTime: '2-3 days',
            revisions: 1,
            features: ['Basic editing', 'Simple transitions', 'Color correction']
          },
          {
            name: 'Standard Edit',
            description: 'Advanced editing with motion graphics',
            price: 400,
            deliveryTime: '3-5 days',
            revisions: 2,
            features: ['Advanced editing', 'Motion graphics', 'Color grading', 'Sound mixing']
          },
          {
            name: 'Premium Edit',
            description: 'Full post-production with special effects',
            price: 800,
            deliveryTime: '5-7 days',
            revisions: 3,
            features: ['Special effects', 'Advanced motion graphics', 'Professional color grading', 'Audio mastering']
          }
        ]
      },
      {
        providerId: createdProviders[2]._id,
        title: 'Professional Content Writing & Copywriting',
        description: 'Engaging content creation for websites, blogs, marketing materials, and social media platforms. SEO-optimized content that drives traffic and converts visitors into customers.',
        shortDescription: 'Professional content creation for websites, blogs, marketing materials, and social media platforms.',
        price: {
          amount: 65,
          unit: 'hour'
        },
        category: 'Writing',
        tags: ['Content Writing', 'Copywriting', 'SEO', 'Blog Writing', 'Marketing'],
        images: [],
        featured: false,
        deliveryTime: '3-5 days',
        revisions: 2,
        requirements: ['Content brief and target keywords', 'Brand voice guidelines', 'Target audience information'],
        rating: {
          average: 0,
          count: 0
        },
        totalOrders: 67,
        packages: [
          {
            name: 'Blog Post',
            description: 'SEO-optimized blog post (800-1200 words)',
            price: 150,
            deliveryTime: '3-5 days',
            revisions: 1,
            features: ['SEO optimization', 'Keyword research', 'Internal linking suggestions']
          },
          {
            name: 'Website Content',
            description: 'Complete website content package',
            price: 300,
            deliveryTime: '1 week',
            revisions: 2,
            features: ['Homepage content', 'About page', 'Service pages', 'Contact page']
          },
          {
            name: 'Content Strategy',
            description: 'Monthly content strategy and writing',
            price: 800,
            deliveryTime: 'Ongoing',
            revisions: 2,
            features: ['Content calendar', '8 blog posts/month', 'Social media content', 'SEO optimization']
          }
        ]
      },
      {
        providerId: createdProviders[3]._id,
        title: 'Professional Beauty & Wellness Services',
        description: 'Comprehensive beauty and wellness services including hair styling, beauty treatments, spa services, and wellness consultations. Professional services for individuals and events.',
        shortDescription: 'Professional beauty and wellness services including hair styling, beauty treatments, and spa services.',
        price: {
          amount: 85,
          unit: 'hour'
        },
        category: 'Other',
        tags: ['Beauty', 'Wellness', 'Hair Styling', 'Spa Services', 'Beauty Treatments'],
        images: [],
        featured: false,
        deliveryTime: 'Same day - 1 week',
        revisions: 1,
        requirements: ['Service preferences', 'Skin/hair type information', 'Allergies or sensitivities'],
        rating: {
          average: 0,
          count: 0
        },
        totalOrders: 234,
        packages: [
          {
            name: 'Basic Hair Service',
            description: 'Haircut and basic styling',
            price: 500,
            deliveryTime: '2-3 hours',
            revisions: 1,
            features: ['Haircut', 'Basic styling', 'Hair consultation']
          },
          {
            name: 'Beauty Treatment',
            description: 'Facial and beauty treatment',
            price: 800,
            deliveryTime: '1-2 hours',
            revisions: 1,
            features: ['Facial treatment', 'Skin analysis', 'Beauty consultation']
          },
          {
            name: 'Spa Package',
            description: 'Complete spa and wellness experience',
            price: 1500,
            deliveryTime: '2-3 hours',
            revisions: 1,
            features: ['Full body massage', 'Facial treatment', 'Wellness consultation', 'Relaxation techniques']
          }
        ]
      },
      {
        providerId: createdProviders[4]._id,
        title: 'Board Game Events & Entertainment',
        description: 'Professional board game events, tournaments, and entertainment services for parties, corporate events, and gatherings. Custom game experiences and tournament organization.',
        shortDescription: 'Professional board game events, tournaments, and entertainment services for parties and gatherings.',
        price: {
          amount: 100,
          unit: 'hour'
        },
        category: 'Other',
        tags: ['Board Games', 'Entertainment', 'Events', 'Tournaments', 'Game Master'],
        images: [],
        featured: false,
        deliveryTime: '1-2 weeks',
        revisions: 1,
        requirements: ['Event details and preferences', 'Number of participants', 'Venue information'],
        rating: {
          average: 0,
          count: 0
        },
        totalOrders: 145,
        packages: [
          {
            name: 'Game Night',
            description: 'Board game night for small groups',
            price: 800,
            deliveryTime: '1 week',
            revisions: 1,
            features: ['Game selection', 'Game master', 'Equipment provided', '3-4 hours']
          },
          {
            name: 'Tournament Event',
            description: 'Board game tournament for larger groups',
            price: 1500,
            deliveryTime: '2 weeks',
            revisions: 1,
            features: ['Tournament organization', 'Prizes', 'Equipment', 'Full day event']
          },
          {
            name: 'Corporate Event',
            description: 'Team building with board games',
            price: 2000,
            deliveryTime: '2 weeks',
            revisions: 1,
            features: ['Team building games', 'Professional facilitation', 'Equipment', 'Custom activities']
          }
        ]
      },
      {
        providerId: createdProviders[5]._id,
        title: 'Piggery & Livestock Management Consulting',
        description: 'Professional piggery and livestock management services including farm setup, animal care, breeding programs, and sustainable farming practices. Expert consultation for farmers and agricultural businesses.',
        shortDescription: 'Professional piggery and livestock management services with sustainable farming practices.',
        price: {
          amount: 200,
          unit: 'hour'
        },
        category: 'Business',
        tags: ['Piggery', 'Livestock', 'Farming', 'Agriculture', 'Consulting'],
        images: [],
        featured: false,
        deliveryTime: '2-4 weeks',
        revisions: 1,
        requirements: ['Farm location and size', 'Current livestock information', 'Business goals'],
        rating: {
          average: 0,
          count: 0
        },
        totalOrders: 78,
        packages: [
          {
            name: 'Farm Assessment',
            description: 'Complete farm assessment and recommendations',
            price: 2000,
            deliveryTime: '1 week',
            revisions: 1,
            features: ['Site evaluation', 'Infrastructure assessment', 'Detailed report', 'Recommendations']
          },
          {
            name: 'Setup Consultation',
            description: 'New piggery setup and management',
            price: 5000,
            deliveryTime: '2-4 weeks',
            revisions: 1,
            features: ['Facility design', 'Equipment selection', 'Management systems', 'Training']
          },
          {
            name: 'Ongoing Management',
            description: 'Monthly management and consultation',
            price: 3000,
            deliveryTime: 'Monthly',
            revisions: 1,
            features: ['Monthly visits', 'Health monitoring', 'Performance tracking', 'Continuous improvement']
          }
        ]
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log('🛠️ Created services');

    // Create sample reviews for services and providers
    console.log('📝 Creating sample reviews...');
    
    // Sample review comments for variety
    const sampleComments = [
      'Excellent work! Very professional and delivered exactly what I needed.',
      'Great communication throughout the project. Highly recommended!',
      'Quality work and fast delivery. Will definitely work with again.',
      'Very skilled and knowledgeable. Exceeded my expectations.',
      'Professional service with attention to detail. Great experience!',
      'Reliable and trustworthy. Delivered on time and within budget.',
      'Outstanding quality and customer service. Highly satisfied!',
      'Very responsive and easy to work with. Great results!',
      'Skilled professional who delivers quality work consistently.',
      'Excellent communication and timely delivery. Highly recommended!',
      'Great attention to detail and professional approach.',
      'Very satisfied with the work quality and service.',
      'Reliable provider who understands client needs perfectly.',
      'Professional, punctual, and delivers excellent results.',
      'Great experience working together. Highly skilled provider!'
    ];

    // Create service reviews
    const serviceReviews = [];
    for (let i = 0; i < createdServices.length; i++) {
      const service = createdServices[i];
      const reviewCount = 3; // Create 3 reviews per service for testing
      
      // Create reviews for each service
      for (let j = 0; j < reviewCount; j++) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars mostly
        const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        const clientIndex = 6 + j; // Use different clients (6-10)
        
        serviceReviews.push({
          serviceId: service._id,
          userId: createdUsers[clientIndex]._id, // Use different client users
          rating: rating,
          comment: comment,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    // Create provider reviews
    const providerReviews = [];
    for (let i = 0; i < createdProviders.length; i++) {
      const provider = createdProviders[i];
      const reviewCount = 3; // Create 3 reviews per provider for testing
      
      // Create reviews for each provider
      for (let j = 0; j < reviewCount; j++) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars mostly
        const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        const clientIndex = 6 + j; // Use different clients (6-10)
        
        providerReviews.push({
          providerId: provider._id,
          userId: createdUsers[clientIndex]._id, // Use different client users
          rating: rating,
          comment: comment,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    // Insert reviews
    await ServiceReview.insertMany(serviceReviews);
    await ProviderReview.insertMany(providerReviews);
    console.log(`📝 Created ${serviceReviews.length} service reviews and ${providerReviews.length} provider reviews`);
    
    // Update all ratings after creating reviews
    console.log('📊 Updating all ratings...');
    await Service.updateAllRatingStats();
    await Provider.updateAllRatingStats();
    console.log('✅ All ratings updated');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`🏢 Providers created: ${createdProviders.length}`);
    console.log(`🛠️ Services created: ${services.length}`);
    console.log(`📝 Service reviews created: ${serviceReviews.length}`);
    console.log(`📝 Provider reviews created: ${providerReviews.length}`);
    console.log('\n🔐 Test credentials:');
    console.log('Provider: jerson.caibog@example.com / password123');
    console.log('Client: client@example.com / password123');
    console.log('\n📍 All providers are located within 1.5km of your location in Tacloban City, Leyte');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedData(); 