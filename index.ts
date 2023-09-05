import express from 'express';
import authRoutes from './routes/user-auth-routes'; // Use ESM syntax for importing the router
import apiRoutes from './routes/open-ai-routes'; // Use ESM syntax for importing the router
import cors from 'cors';


const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Set up middleware to parse JSON data from requests
app.use(express.json());

// Your routes and logic will go here
  
  /**
   * All routes goes here
   */
  app.use('/auth', authRoutes)  // Login authentication routes
  app.use('/api', apiRoutes)    // Open AI routes

  
 
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
