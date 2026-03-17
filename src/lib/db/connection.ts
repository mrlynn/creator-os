import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseConnection {
  isConnected?: number;
}

const connection: MongooseConnection = {};

export async function connectToDatabase() {
  if (connection.isConnected) {
    return mongoose;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI!);
    connection.isConnected = db.connections[0].readyState;
    console.log('✓ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log('✓ Disconnected from MongoDB');
  }
}
