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
exports.searchEmbeddings = exports.saveChunks = exports.getAllChatHistoryForUser = exports.userAuth = exports.getAll = exports.getById = exports.del = exports.update = exports.save = void 0;
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
// Save file chunks
const saveChunks = (data, collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield connectToDB(); // Wait for the connection to be established
        const collection = db.collection(collectionName);
        const result = yield collection.insertOne({ documentField: data }); // Wrap data in an object
        console.log('Data inserted successfully:', result.insertedId);
        return result.insertedId;
    }
    catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
});
exports.saveChunks = saveChunks;
// Define your search function
const searchEmbeddings = (userQueryEmbedding, collectionName, limit = 1, similarityThreshold = 0.9) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to the MongoDB database
        const db = yield connectToDB();
        // Calculate the square of each value in userQueryEmbedding
        const querySquared = userQueryEmbedding.map(queryValue => ({
            $pow: [queryValue, 2]
        }));
        // Calculate the sum of squared values in userQueryEmbedding
        const querySquaredSum = {
            $sum: querySquared
        };
        // Calculate the square root of the sum of squared values in userQueryEmbedding
        const userQueryEmbeddingSqrt = {
            $sqrt: querySquaredSum
        };
        // Define your aggregation pipeline to calculate similarity scores
        const pipeline = [
            {
                $project: {
                    _id: 1,
                    embedding: 1, // The field where embeddings are stored
                },
            },
            {
                $addFields: {
                    similarityScore: {
                        $subtract: [
                            1,
                            {
                                $divide: [
                                    {
                                        $sum: userQueryEmbedding.map((queryValue, index) => ({
                                            $multiply: [
                                                queryValue,
                                                { $arrayElemAt: ["$embedding", index] }
                                            ]
                                        }))
                                    },
                                    {
                                        $multiply: [
                                            { $sqrt: { $sum: querySquared } },
                                            { $sqrt: querySquaredSum }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                },
            },
            {
                $match: {
                    similarityScore: { $gte: similarityThreshold }
                }
            },
            {
                $sort: {
                    similarityScore: -1, // Sort by similarity in descending order
                },
            },
            {
                $limit: limit // Limit the number of documents returned
            }
        ];
        // Execute the aggregation pipeline
        const relevantDocuments = yield db.collection(collectionName).aggregate(pipeline).toArray();
        console.log(relevantDocuments);
        // Return the relevant documents
        return relevantDocuments;
    }
    catch (error) {
        console.error('Error searching embeddings:', error);
        throw error;
    }
});
exports.searchEmbeddings = searchEmbeddings;
