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
exports.configureUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
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
