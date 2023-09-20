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
const chat_gpt_func_1 = require("../openai/chat-gpt-func");
const chatgpt_1 = require("../openai/chatgpt");
const mongoDb_1 = require("../services/mongoDb");
const middleware_1 = require("../utils/middleware");
const fileFunc_1 = require("../utils/fileFunc");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Define API routes and logic here
/**
 * Get all the open ai models
 * /api/models
 */
router.get('/models', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Call the getModels function to fetch the data
        const result = yield (0, chatgpt_1.getModels)();
        // Assuming the 'result' contains the response object
        res.json({ models: result.data.data });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch models' });
    }
}));
/**
 * Get a specific model by ID
 * /api/models/:modelId
 */
router.get('/models/:modelId', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modelId = req.params.modelId;
        // Call the getModels function with the modelId to fetch the data
        const result = yield (0, chatgpt_1.getModel)(modelId);
        // Assuming the 'result' contains the response object for the specific model
        res.json({ model: result.data });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch model by ID' });
    }
}));
router.post('/chat', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.sub;
    const data = req.body;
    data.userId = userId;
    try {
        const result = yield (0, chat_gpt_func_1.create)(data);
        res.json({ response: result });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve chat response' });
    }
}));
router.put('/chat/:chatId', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatId;
    const data = req.body;
    data.chatId = chatId;
    // console.log(data.chatId)
    try {
        const result = yield (0, chat_gpt_func_1.chatUpdate)(data);
        res.json({ response: result });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve chat response' });
    }
}));
//Get all user specific chats
router.get('/chat', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.sub;
    try {
        const result = yield (0, chat_gpt_func_1.getAllUserChats)(userId);
        res.json({ response: result });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve chat responses' });
    }
}));
// Get chat by id
router.get('/chat/:id', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const result = yield (0, chat_gpt_func_1.getOneChat)(id);
        res.json({ response: result });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve the specific chat responses' });
    }
}));
router.post('/upload/', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const upload = yield (0, fileFunc_1.configureUpload)();
    upload.single('file')(req, res, (error) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'File upload failed.' });
        }
        else {
            try {
                const { originalname, filename } = req.file;
                const { doc_name } = req.body;
                // Prepare the data to be saved
                const fileData = {
                    doc_name: doc_name,
                    file_name: originalname,
                    file_location: './docs/' + filename,
                    embeddings: null
                };
                // Save file metadata to MongoDB
                const filemeta = yield (0, mongoDb_1.save)(fileData, process.env.FILE_METADATA); // Replace with your collection name
                // console.log("file uploaded and file meta data saved!")
                // Save file content in the system
                const emb = yield (0, fileFunc_1.saveFileContent)(fileData);
                res.json({ message: 'File uploaded, embedding generated and saved successfully.' });
            }
            catch (error) {
                console.error('Error saving file metadata:', error);
                res.status(500).json({ message: 'File upload failed.' });
            }
        }
    }));
}));
// Export the router object
exports.default = router;
