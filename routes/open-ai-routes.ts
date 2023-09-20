import { chatUpdate, create, getAllUserChats, getOneChat } from '../openai/chat-gpt-func';
import { getModels, getModel, chat } from '../openai/chatgpt';
import { getById, save } from '../services/mongoDb';
import { authenticateJWT } from '../utils/middleware';
import { configureUpload, saveFileContent } from '../utils/fileFunc';
import express from 'express';
const router = express.Router();

// Define API routes and logic here
/**
 * Get all the open ai models 
 * /api/models
 */
router.get('/models', authenticateJWT, async(req: any, res: any) => {
    try {
        // Call the getModels function to fetch the data
        const result = await getModels();
    
        // Assuming the 'result' contains the response object
        res.json({ models: result.data.data });
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch models' });
      }
});

/**
 * Get a specific model by ID
 * /api/models/:modelId
 */
router.get('/models/:modelId', authenticateJWT, async (req: any, res: any) => {
  try {
    const modelId = req.params.modelId;
    // Call the getModels function with the modelId to fetch the data
    const result = await getModel(modelId);
    // Assuming the 'result' contains the response object for the specific model
    res.json({ model: result.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch model by ID' });
  }
});

router.post('/chat',authenticateJWT, async (req:any, res: any) => {
  
  const userId = req.user.sub;
  const data = req.body;
  data.userId = userId;

  try {
    const result = await create(data);
    res.json({response: result})
  } catch (error) {
    res.status(500).json({message: 'Failed to retrieve chat response' })
  }
})

router.put('/chat/:chatId', authenticateJWT,async (req:any, res: any) => {
  const chatId = req.params.chatId;
  const data = req.body;
  data.chatId = chatId;

  // console.log(data.chatId)

  try {
    const result = await chatUpdate(data);
    res.json({response: result})
  } catch (error) {
    res.status(500).json({message: 'Failed to retrieve chat response' })
  }
})

//Get all user specific chats
router.get('/chat', authenticateJWT,async (req:any, res:any) => {
  const userId = req.user.sub;
  try {
    const result = await getAllUserChats(userId);
    res.json({response: result})
  } catch (error) {
    res.status(500).json({message: 'Failed to retrieve chat responses'})
  }
})

// Get chat by id
router.get('/chat/:id', authenticateJWT,async (req:any, res: any) => {
  const id = req.params.id;

  try {
    const result = await getOneChat(id);
    res.json({response: result})
  } catch (error) {
    res.status(500).json({message: 'Failed to retrieve the specific chat responses'})
  }
})

router.post('/upload/', authenticateJWT, async (req: any, res: any) => {
  const upload = await configureUpload();
  upload.single('file')(req, res, async (error) => {
    if (error) {
      console.log(error)
      res.status(500).json({ message: 'File upload failed.' });
    } else {
      try {
        const { originalname, filename } = req.file;
        const { doc_name } = req.body;

        // Prepare the data to be saved
        const fileData = {
          doc_name: doc_name,
          file_name: originalname,
          file_location: './docs/' + filename, // Assuming filename is the path to the stored file
          embeddings: null
        };

        // Save file metadata to MongoDB
        const filemeta = await save(fileData, process.env.FILE_METADATA); // Replace with your collection name
        // console.log("file uploaded and file meta data saved!")

        // Save file content in the system
        const emb = await saveFileContent(fileData);

        res.json({ message: 'File uploaded, embedding generated and saved successfully.' });
        
      } catch (error) {
        console.error('Error saving file metadata:', error);
        res.status(500).json({ message: 'File upload failed.' });
      }
    }
  });
});

// Export the router object
export default router;
