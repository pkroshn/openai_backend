"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.verifyToken = exports.generateToken = void 0;
// authUtils.js
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto = require('crypto');
require("dotenv/config");
const secretKey = process.env.SECRET_KEY || 'default-secret-key';
// Function to generate a JWT token
const generateToken = (userId) => {
    const tokenPayload = {
        sub: userId.toString(), // 'sub' is commonly used to store the user ID in the payload
        // You can add more custom claims here if needed
    };
    // Sign the token with the secret key and set an expiration time (e.g., 1 hour)
    const token = jsonwebtoken_1.default.sign(tokenPayload, secretKey, { expiresIn: '1h' });
    return token;
};
exports.generateToken = generateToken;
// Function to verify a JWT token
const verifyToken = (token) => {
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
        return decodedToken;
    }
    catch (error) {
        return null; // Invalid token
    }
};
exports.verifyToken = verifyToken;
// Function to compare passwords using bcrypt
const comparePasswords = (password, passwordHash) => {
    return bcrypt_1.default.compareSync(password, passwordHash);
};
exports.comparePasswords = comparePasswords;
