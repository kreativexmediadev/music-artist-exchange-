// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');

// Function to connect to the database
const connectDatabase = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    
    // Connect to MongoDB with some recommended options
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,      // Use new URL parser
      useUnifiedTopology: true    // Use new server discovery and monitoring engine
    });
    
    console.log('Connected to MongoDB database');
  } catch (error) {
    // Log error and exit application if connection fails
    console.error('MongoDB connection error:', error.message);
    process.exit(1);  // Exit with failure code
  }
};

// Export the function for use in other files
module.exports = connectDatabase;