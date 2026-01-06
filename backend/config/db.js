const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log('⚠️  No MONGO_URI found. Using file-based storage.');
    return;
  }

  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Helpful error messages
    if (error.message.includes('authentication failed')) {
      console.error('💡 Check your MongoDB Atlas username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Check your internet connection and MongoDB Atlas cluster URL');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Check Network Access settings in MongoDB Atlas (allow your IP)');
    }
    
    // Don't exit process - allow app to run without MongoDB
    console.log('⚠️  Continuing without MongoDB. Using file-based storage.');
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
