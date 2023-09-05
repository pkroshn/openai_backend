// middleware.js
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const key = process.env.SECRET_KEY || 'default-secret-key';

// Function to verify a JWT token and protect endpoints
export const authenticateJWT = (req: any, res : any, next : any) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, key, (err : any, user : any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user; // Attach the user object to the request for further use
    console.log(req.user);
    next();
  });
};
