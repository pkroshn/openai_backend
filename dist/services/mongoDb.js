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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChatHistoryForUser = exports.userAuth = exports.getAll = exports.getById = exports.del = exports.update = exports.save = void 0;
// const { MongoClient } = require('mongodb');
const mongodb_1 = require("mongodb");
require("dotenv/config");
const uri = process.env.MONGODB_URI || "default";
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
let db;
function connectToDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new mongodb_1.MongoClient(uri);
            yield client.connect();
            db = client.db(dbName);
            console.log('Connected to MongoDB Atlas!');
            return db; // Return the connected database object
        }
        catch (error) {
            console.error('Error connecting to MongoDB Atlas:', error);
            throw error;
        }
    });
}
const save = (data, collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield connectToDB(); // Wait for the connection to be established
        const collection = db.collection(collectionName);
        const result = yield collection.insertOne(data);
        console.log('Data inserted successfully:', result.insertedId);
        return result.insertedId;
    }
    catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
});
exports.save = save;
const update = (collectionName, filter, update) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the MongoDB database on server startup
        const db = yield connectToDB(); // Wait for the connection to be established
        const collection = db.collection(collectionName);
        const result = yield collection.updateOne(filter, { $set: update });
        console.log('Data updated successfully:', result.modifiedCount);
        return result.modifiedCount;
    }
    catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
});
exports.update = update;
const del = (collectionName, filter) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the MongoDB database on server startup
        const db = yield connectToDB(); // Wait for the connection to be established
        const collection = db.collection(collectionName);
        const result = yield collection.deleteOne(filter);
        console.log('Data deleted successfully:', result.deletedCount);
        return result.deletedCount;
    }
    catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
});
exports.del = del;
const getById = (collectionName, filter) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the MongoDB database on server startup
        const db = yield connectToDB(); // Wait for the connection to be established
        const collection = db.collection(collectionName);
        const document = yield collection.findOne(filter);
        return document;
    }
    catch (error) {
        console.error('Error getting data:', error);
        throw error;
    }
});
exports.getById = getById;
const getAll = (collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the MongoDB database on server startup
        const db = yield connectToDB(); // Wait for the connection to be established
        const collection = db.collection(collectionName);
        const documents = yield collection.find().toArray();
        return documents;
    }
    catch (error) {
        console.error('Error getting data:', error);
        throw error;
    }
});
exports.getAll = getAll;
// Modify the getById function to find a user by username
const userAuth = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield connectToDB();
        const collection = db.collection('users');
        const user = yield collection.findOne({ username });
        // console.log(user);
        return user;
    }
    catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
});
exports.userAuth = userAuth;
// Get all chat history for a specific user
const getAllChatHistoryForUser = (collectionName, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = { user: userId }; // Filter to match the user ID
        console.log(filter);
        const db = yield connectToDB(); // Connect to the MongoDB database
        const collection = db.collection(collectionName);
        // Retrieve all chat history records for the user
        const chatHistory = yield collection.find(filter).toArray();
        console.log(chatHistory);
        return chatHistory;
    }
    catch (error) {
        console.error('Error getting chat history for user:', error);
        throw error;
    }
});
exports.getAllChatHistoryForUser = getAllChatHistoryForUser;
