import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import Docxtemplater from 'docxtemplater';
import { getAll, save, saveChunks } from '../services/mongoDb';
import { generateEmbedding } from '../openai/chatgpt';

export const configureUpload = async () => {
  // Perform any async operations here before configuring multer

  // Set up storage for uploaded files
  const storage = multer.diskStorage({
    destination: './docs/', // Folder to store the uploaded files
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  // Create the multer upload instance
  const uploadInstance = multer({
    storage: storage,
    limits: { fileSize: 10000000 } // Limit the file size (in bytes)
  });  

  return uploadInstance;
};

//Read the file and return the content
export const readFile =async (filePath:any) => {
  const extension = filePath.split('.').pop().toLowerCase()

  switch(extension) {
    case 'txt':
      return fs.readFileSync(filePath, 'utf-8')
    case 'pdf':
      const pdfData = await fs.promises.readFile(filePath)
      const pdfContent = await pdf(pdfData)
      return pdfContent.text
    case 'docx':
      const docxContent = await fs.promises.readFile(filePath, 'binary')
      const docx = new Docxtemplater();
      docx.loadZip(docxContent)
      return docx.getFullText()
    default:
      throw new Error('Unsupported file format.')
  }
}

//Save the file contents to the database
export const saveFileContent = async (params: any) => {
  try {
    // Read the file content
    const fileContent = await readFile(params.file_location);

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
      const embedding = await generateEmbedding(chunk);

      chunkDocuments.push({
        filename: params.doc_name, // Replace with the actual file name
        position: index,
        data: chunk,
        embedding: embedding, // Store the embedding in the document
      });

    }

    console.log(chunkDocuments)

    const result = await saveChunks(chunkDocuments, collectionName);

    console.log("Chunks saved!");

    // Continue with other processing or logic as needed
    console.log("")

    console.log('File content saved and processed.');
    return result;

  } catch (error) {
    console.error('Error:', error);
  }
};

// Get all the uploaded file list
export const getListOfAllUploadedFiles = async () => {
  try {
    const data = await getAll(process.env.FILE_METADATA);
    return { message: data }
  } catch (error) {
    console.error('Error during getting stored files list.. ')
    throw error;
  }
}



