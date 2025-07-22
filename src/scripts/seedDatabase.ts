import connectToDatabase from '../lib/mongodb';
import LLMModel from '../models/LLMModel';
import { defaultModels } from '../data/models';

async function seedDatabase() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Clear existing models
    await LLMModel.deleteMany({ isCustom: false });
    console.log('Cleared existing default models');

    // Insert default models
    const modelsToInsert = defaultModels.map(model => ({
      ...model,
      isCustom: false,
      isPublic: true,
      createdBy: 'system',
    }));

    await LLMModel.insertMany(modelsToInsert);
    console.log(`Inserted ${modelsToInsert.length} default models`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();