"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_auth_routes_1 = __importDefault(require("./routes/user-auth-routes")); // Use ESM syntax for importing the router
const open_ai_routes_1 = __importDefault(require("./routes/open-ai-routes")); // Use ESM syntax for importing the router
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Enable CORS for all routes
app.use((0, cors_1.default)());
// Set up middleware to parse JSON data from requests
app.use(express_1.default.json());
// Your routes and logic will go here
/**
 * All routes goes here
 */
app.use('/auth', user_auth_routes_1.default); // Login authentication routes
app.use('/api', open_ai_routes_1.default); // Open AI routes
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
