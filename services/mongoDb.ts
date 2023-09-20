// const { MongoClient } = require('mongodb');
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI || "default";
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
let db : any;

async function connectToDB() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB Atlas!');
    return db; // Return the connected database object
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

export const save = async (data: any, collectionName: any) => {
  try {
      const db = await connectToDB(); // Wait for the connection to be established
      const collection = db.collection(collectionName);
      const result = await collection.insertOne(data);
      console.log('Data inserted successfully:', result.insertedId);
      return result.insertedId;
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}
  
export const update = async (collectionName: any, filter: any, update: any) => {
  try {
      // Connect to the MongoDB database on server startup
      const db = await connectToDB(); // Wait for the connection to be established

      const collection = db.collection(collectionName);
      const result = await collection.updateOne(filter, { $set: update });
      console.log('Data updated successfully:', result.modifiedCount);
      return result.modifiedCount;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
}
  
export const del = async (collectionName: any, filter: any) => {
  try {
      // Connect to the MongoDB database on server startup
      const db = await connectToDB(); // Wait for the connection to be established

      const collection = db.collection(collectionName);
      const result = await collection.deleteOne(filter);
      console.log('Data deleted successfully:', result.deletedCount);
      return result.deletedCount;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
}
  
export const getById = async (collectionName: any, filter : any) => {
  try {
      // Connect to the MongoDB database on server startup
      const db = await connectToDB(); // Wait for the connection to be established

      const collection = db.collection(collectionName);
      const document = await collection.findOne(filter);
      return document;
  } catch (error) {
      console.error('Error getting data:', error);
      throw error;
  }
}
  
export const getAll = async (collectionName : any) => {
    try {
        // Connect to the MongoDB database on server startup
      const db = await connectToDB(); // Wait for the connection to be established

        const collection = db.collection(collectionName);
        const documents = await collection.find().toArray();
        return documents;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
}

// Modify the getById function to find a user by username
export const userAuth = async (username: string) => {
  try {
    const db = await connectToDB();
    const collection = db.collection('users');
    const user = await collection.findOne({ username });
    // console.log(user);
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Get all chat history for a specific user
export const getAllChatHistoryForUser = async (collectionName: any, userId: any) => {
  try {
    const filter = { user: userId }; // Filter to match the user ID
    console.log(filter)

    const db = await connectToDB(); // Connect to the MongoDB database
    const collection = db.collection(collectionName);

    // Retrieve all chat history records for the user
    const chatHistory = await collection.find(filter).toArray();
    console.log(chatHistory)

    return chatHistory;
  } catch (error) {
    console.error('Error getting chat history for user:', error);
    throw error;
  }
};

// Save file chunks
export const saveChunks = async (data: any, collectionName: any) => {
  try {
    const db = await connectToDB(); // Wait for the connection to be established
    const collection = db.collection(collectionName);
    const result = await collection.insertOne({ documentField: data }); // Wrap data in an object
    console.log('Data inserted successfully:', result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}

// Define your search function
export const searchEmbeddings = async (userQueryEmbedding: number[], collectionName: any) => {
  try {
    // Connect to the MongoDB database
    const db = await connectToDB();

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
        $sort: {
          similarityScore: -1, // Sort by similarity in descending order
        },
      },
    ];

    // Execute the aggregation pipeline
    const relevantDocuments = await db.collection(collectionName).aggregate(pipeline).toArray();
    console.log(relevantDocuments)
    // Return the relevant documents
    return relevantDocuments;
  } catch (error) {
    console.error('Error searching embeddings:', error);
    throw error;
  }
};
  