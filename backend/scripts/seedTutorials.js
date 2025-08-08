import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Tutorial from '../models/Tutorial.js';

dotenv.config();

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CATEGORIES = ['beginner', 'intermediate', 'advanced', 'technique', 'inspiration'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const TAG_POOL = [
  'digital', 'painting', 'sketch', 'color', 'composition', 'lighting', 'brushes',
  'layers', 'blending', 'anatomy', 'perspective', 'texture', 'shading', 'style'
];
const MATERIAL_POOL = ['pencil', 'paper', 'tablet', 'stylus', 'marker', 'ink', 'eraser', 'canvas'];

async function ensureAuthorUser() {
  // Prefer an existing admin, then any user; otherwise create a seed admin
  let author = await User.findOne({ role: 'admin' });
  if (!author) author = await User.findOne();
  if (!author) {
    author = await User.create({
      email: `seed-admin-${Date.now()}@example.com`,
      username: `seed_admin_${Date.now()}`,
      password: await bcrypt.hash('password123', 12),
      role: 'admin',
      firstName: 'Seed',
      lastName: 'Admin',
      isVerified: true,
    });
  }
  return author;
}

function buildSteps(count = 4) {
  const steps = [];
  for (let i = 1; i <= count; i++) {
    steps.push({
      title: `Step ${i} Title`,
      description: `Detailed instructions for step ${i}. Focus on the technique and explain concisely.`,
      imageUrl: '',
      order: i,
    });
  }
  return steps;
}

function buildTutorial(i, authorId) {
  const title = `Tutorial ${i}: ${pick(['Mastering', 'Introduction to', 'Guide to', 'Essentials of', 'Advanced'])} ${pick(['Shading', 'Color Theory', 'Sketching', 'Digital Painting', 'Composition'])}`;
  const category = pick(CATEGORIES);
  const difficulty = pick(DIFFICULTIES);
  const estimatedTime = randInt(20, 90);
  const tags = Array.from({ length: randInt(3, 6) }, () => pick(TAG_POOL));
  const materials = Array.from({ length: randInt(2, 5) }, () => pick(MATERIAL_POOL));

  return {
    title,
    description: 'A concise overview of what you will learn and the outcome you will achieve by following this tutorial.',
    content: 'Full tutorial content explaining the techniques, tips, and best practices in depth.\n\nUse this as placeholder body text for demonstration.',
    category,
    tags,
    thumbnail: '',
    videoUrl: '',
    author: authorId,
    isPublished: Math.random() > 0.3,
    views: randInt(0, 500),
    likes: randInt(0, 100),
    difficulty,
    estimatedTime,
    materials,
    steps: buildSteps(randInt(3, 6)),
  };
}

async function seedTutorials() {
  try {
    console.log('🌱 Seeding 20 tutorials...');
    await mongoose.connect(process.env.MONGO_URI);

    const author = await ensureAuthorUser();

    const tutorials = [];
    for (let i = 1; i <= 20; i++) {
      tutorials.push(buildTutorial(i, author._id));
    }

    const created = await Tutorial.insertMany(tutorials);
    console.log(`✅ Created ${created.length} tutorials`);
  } catch (err) {
    console.error('❌ Error seeding tutorials:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

seedTutorials();


