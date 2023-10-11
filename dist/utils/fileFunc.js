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
exports.getListOfAllUploadedFiles = exports.saveFileContent = exports.readFile = exports.configureUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const mongoDb_1 = require("../services/mongoDb");
const chatgpt_1 = require("../openai/chatgpt");
const configureUpload = () => __awaiter(void 0, void 0, void 0, function* () {
    // Perform any async operations here before configuring multer
    // Set up storage for uploaded files
    const storage = multer_1.default.diskStorage({
        destination: './docs/',
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
        }
    });
    // Create the multer upload instance
    const uploadInstance = (0, multer_1.default)({
        storage: storage,
        limits: { fileSize: 10000000 } // Limit the file size (in bytes)
    });
    return uploadInstance;
});
exports.configureUpload = configureUpload;
//Read the file and return the content
const readFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const extension = filePath.split('.').pop().toLowerCase();
    switch (extension) {
        case 'txt':
            return fs_1.default.readFileSync(filePath, 'utf-8');
        case 'pdf':
            const pdfData = yield fs_1.default.promises.readFile(filePath);
            const pdfContent = yield (0, pdf_parse_1.default)(pdfData);
            return pdfContent.text;
        case 'docx':
            const docxContent = yield fs_1.default.promises.readFile(filePath, 'binary');
            const docx = new docxtemplater_1.default();
            docx.loadZip(docxContent);
            return docx.getFullText();
        default:
            throw new Error('Unsupported file format.');
    }
});
exports.readFile = readFile;
//Save the file contents to the database
const saveFileContent = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the file content
        const fileContent = yield (0, exports.readFile)(params.file_location);
        // Split the content into words
        const words = fileContent.split(/\s+/); // Split by whitespace characters
        // Generate the chunks with approximately 100 words each
        const chunkSizeWords = 1000;
        const chunks = [];
        let currentChunk = [];
        for (const word of words) {
            currentChunk.push(word);
            if (currentChunk.length >= chunkSizeWords) {
                chunks.push(currentChunk.join(' '));
                currentChunk = [];
            }
        }
        // If there are remaining words, add them as the last chunk
        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(' '));
        }
        // Save to the database with generated UUIDs
        const collectionName = process.env.FILE_CHUNKS; // Set your collection name
        const chunkDocuments = [];
        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];
            // Generate an embedding for the chunk using OpenAI's GPT-3
            const embedding = yield (0, chatgpt_1.generateEmbedding)(chunk);
            chunkDocuments.push({
                filename: params.doc_name,
                position: index,
                data: chunk,
                embedding: embedding, // Store the embedding in the document
            });
        }
        console.log(chunkDocuments);
        const result = yield (0, mongoDb_1.saveChunks)(chunkDocuments, collectionName);
        console.log("Chunks saved!");
        // Continue with other processing or logic as needed
        console.log("");
        console.log('File content saved and processed.');
        return result;
    }
    catch (error) {
        console.error('Error:', error);
    }
});
exports.saveFileContent = saveFileContent;
// Get all the uploaded file list
const getListOfAllUploadedFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, mongoDb_1.getAll)(process.env.FILE_METADATA);
        return { message: data };
    }
    catch (error) {
        console.error('Error during getting stored files list.. ');
        throw error;
    }
});
exports.getListOfAllUploadedFiles = getListOfAllUploadedFiles;
