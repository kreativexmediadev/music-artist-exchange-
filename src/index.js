// src/index.js

// Import required packages
const express = require('express');  // Express is our web server framework
const dotenv = require('dotenv');    // For loading environment variables
const cors = require('cors');        // For handling Cross-Origin Resource Sharing
const connectDatabase = require('./config/database'); // Database connection function

// Load environment variables from .env file
dotenv.config();

// Initialize express application
const app = express();

// Middleware
app.use(cors());                    // Enable CORS for all routes
app.use(express.json());            // Parse JSON request bodies

// Simple route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Music Artist Exchange API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Set port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Connect to database then start server
const startServer = async () => {
  try {
    // Connect to the database
    await connectDatabase();
    
    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Start the server
startServer();
