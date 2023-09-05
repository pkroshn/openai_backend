"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
// middleware.js
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const key = process.env.SECRET_KEY || 'default-secret-key';
// Function to verify a JWT token and protect endpoints
const authenticateJWT = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    jsonwebtoken_1.default.verify(token, key, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user; // Attach the user object to the request for further use
        console.log(req.user);
        next();
    });
};
exports.authenticateJWT = authenticateJWT;
