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
const fileUpload_1 = require("../utils/fileUpload");
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../utils/middleware");
const mongoDb_1 = require("../services/mongoDb");
const router = express_1.default.Router();
// File upload
router.post('/upload/', middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const upload = yield (0, fileUpload_1.configureUpload)();
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
                    file_location: filename // Assuming filename is the path to the stored file
                };
                // Save file metadata to MongoDB
                yield (0, mongoDb_1.save)(fileData, process.env.FILE_METADATA); // Replace with your collection name
                res.json({ message: 'File uploaded and metadata saved.' });
            }
            catch (error) {
                console.error('Error saving file metadata:', error);
                res.status(500).json({ message: 'File upload failed.' });
            }
        }
    }));
}));
