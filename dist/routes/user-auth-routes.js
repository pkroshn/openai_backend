"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// authRoutes.ts
const express_1 = __importDefault(require("express"));
const authUtils_1 = require("../utils/authUtils");
const mongoDb_1 = require("../services/mongoDb");
require("dotenv/config");
const router = express_1.default.Router();
// Define authentication routes and logic here
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Get the user from the database based on the provided username
        const user = yield (0, mongoDb_1.userAuth)(username);
        // If the user is not found or the password is incorrect, return an error
        if (!user || !(0, authUtils_1.comparePasswords)(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // User authenticated, issue a JWT token with the user ID
        const token = (0, authUtils_1.generateToken)(user._id);
        // Send the token back to the client
        res.json({ token });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, username, password, email } = req.body;
    try {
        // Assuming you have a 'users' collection in your MongoDB database
        const userData = {
            firstName,
            lastName,
            username,
            password,
            email,
            // Any other user information you want to store
        };
        // Save the user data to the 'users' collection in MongoDB
        const insertedId = yield (0, mongoDb_1.save)(userData, process.env.USERS_TABLE);
        // You can send additional data in the response, like the newly created user ID
        res.json({ message: 'User registered successfully', userId: insertedId });
    }
    catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
}));
// Export the router object
exports.default = router;
