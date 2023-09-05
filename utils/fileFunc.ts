import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import Docxtemplater from 'docxtemplater';
import { save } from '../services/mongoDb';
import { generateEmbedding } from '../openai/chatgpt';

export const configureUpload = async () => {
  // Perform any async operations here before configuring multer

  // Set up storage for uploaded files
  const storage = multer.diskStorage({
    destination: './doc/', // Folder to store the uploaded files
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

// Save file content
export const saveFileContent =async (filePath:any) => {
  try {
    // Read the file content
    const fileContent = await readFile(filePath);
    console.log("file content generated.")    

    // Generate the chunks
    const chunkSize = 1000; // Set your desired chunk size
    const chunks = [];
    for (let i = 0; i < fileContent.length; i += chunkSize) {
      chunks.push(fileContent.slice(i, i + chunkSize));
    }

    console.log("chunks generated from the content!")
    // Save to db using your existing save function
    const collectionName = process.env.FILE_CHUNKS; // Set your collection name
    const chunkDocuments = chunks.map((chunk, index) => ({
      chunk_id: index + 1,
      text: chunk,
    }));
    await save(chunkDocuments, collectionName);
    console.log("chunks saved!")

    // Generate Embeddings from openAI
    // Assuming you have the OpenAI logic to generate embeddings here
    const query = 'Leave policy information of the permanent empolyees';
    const queryEmbedding = await generateEmbedding(query);

    // Update MongoDB with query embedding
    await save({ query_embedding: queryEmbedding }, collectionName);

    console.log('File content saved and processed.');
  } catch (error) {
    console.error('Error:', error);
  }
}


