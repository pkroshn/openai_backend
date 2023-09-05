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
exports.saveFileContent = exports.readFile = exports.configureUpload = void 0;
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
        destination: './doc/',
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
// Save file content
const saveFileContent = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the file content
        const fileContent = yield (0, exports.readFile)(filePath);
        // Generate the chunks
        const chunkSize = 1000; // Set your desired chunk size
        const chunks = [];
        for (let i = 0; i < fileContent.length; i += chunkSize) {
            chunks.push(fileContent.slice(i, i + chunkSize));
        }
        // Save to db using your existing save function
        const collectionName = process.env.FILE_CHUNKS; // Set your collection name
        const chunkDocuments = chunks.map((chunk, index) => ({
            chunk_id: index + 1,
            text: chunk,
        }));
        yield (0, mongoDb_1.save)(chunkDocuments, collectionName);
        // Generate Embeddings from openAI
        // Assuming you have the OpenAI logic to generate embeddings here
        const query = 'Your search query...';
        const queryEmbedding = yield (0, chatgpt_1.generateEmbedding)(query);
        // Update MongoDB with query embedding
        yield (0, mongoDb_1.save)({ query_embedding: queryEmbedding }, collectionName);
        console.log('File content saved and processed.');
    }
    catch (error) {
        console.error('Error:', error);
    }
});
exports.saveFileContent = saveFileContent;
