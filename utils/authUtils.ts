// authUtils.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const crypto = require('crypto');
import 'dotenv/config';

const secretKey = process.env.SECRET_KEY || 'default-secret-key';

// Function to generate a JWT token
export const generateToken = (userId: any) => {
  const tokenPayload = {
    sub: userId.toString(), // 'sub' is commonly used to store the user ID in the payload
    // You can add more custom claims here if needed
  };

  // Sign the token with the secret key and set an expiration time (e.g., 1 hour)
  const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

  return token;
};

// Function to verify a JWT token
export const verifyToken = (token: any) => {
  try {
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    return null; // Invalid token
  }
};

// Function to compare passwords using bcrypt
export const comparePasswords = (password: any, passwordHash: any) => {
  return bcrypt.compareSync(password, passwordHash);
};
