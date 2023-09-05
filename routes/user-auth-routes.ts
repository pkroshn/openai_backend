// authRoutes.ts
import express from 'express';
import { generateToken, verifyToken, comparePasswords } from '../utils/authUtils';
import { save, userAuth } from '../services/mongoDb';
import 'dotenv/config';

const router = express.Router();

// Define authentication routes and logic here
router.post('/login', async (req: any, res: any) => {
  const { username, password } = req.body;

  try {
    // Get the user from the database based on the provided username
    const user = await userAuth(username);

    // If the user is not found or the password is incorrect, return an error
    if (!user || !comparePasswords(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // User authenticated, issue a JWT token with the user ID
    const token = generateToken(user._id);

    // Send the token back to the client
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req : any, res : any) => {
  const { username, password, email } = req.body;
  
  try {
    // Assuming you have a 'users' collection in your MongoDB database
    const userData = {
      username,
      password, // Note: This should be a hashed password for better security
      email,
      // Any other user information you want to store
    };

    // Save the user data to the 'users' collection in MongoDB
    const insertedId = await save(userData, process.env.USERS_TABLE);

    // You can send additional data in the response, like the newly created user ID
    res.json({ message: 'User registered successfully', userId: insertedId });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Export the router object
export default router;
