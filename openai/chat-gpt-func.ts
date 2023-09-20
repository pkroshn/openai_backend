import { chat, generateEmbedding } from './chatgpt';
import { getAll, getAllChatHistoryForUser, getById, save, searchEmbeddings, update } from '../services/mongoDb';
import { authenticateJWT } from '../utils/middleware';
import { ObjectId } from 'mongodb';
import { readFile } from '../utils/fileFunc';

function generateConversationName(messages : any) {
  // Extract keywords or phrases from messages
  const keywords = messages.flatMap((message: { content: any; }) => message.content.split(' '));

  // Generate a conversation name using keywords
  if (keywords.length > 0) {
    const conversationName = keywords.join(' ');
    return conversationName;
  } else {
    return "Unnamed Conversation";
  }
}

// Generate standard question
async function generateStandardQuestion(data:any, new_qestion: string) {
  try {
    console.log("New Question: " + new_qestion)
      // Extract relevant context from the chat history
    const userMessages = data.messages.filter((message: { role: string; }) => message.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    const context = lastUserMessage.content;

    // Create a standard question based on the context
    // const standardQuestion = `Based on your previous message "${context}", is there anything else you'd like to know?`;
    const standardQuestion = `What is the standard question based on the "${context}"?`;

    // Now you can use 'standardQuestion' along with the new question
    const newQuestion = 'What are the typical benefits for permanent employees?';
    const completePrompt = `${standardQuestion} ${new_qestion}`;

    const params = {
      model: process.env.OPENAI_MODEL,
      messages: [{
        role: 'user',
        content: completePrompt
      }],
      userId: data.user
    }

    // console.log("params:")
    console.log(params)

    // Use the OpenAI API to generate a response to the complete prompt
    const response = await chat(params);

    // console.log("Response is " + response.message)

    // Parse the generated response to extract the new question
    if (response && response.message) {
      return response.message;
    } else {
      console.log("Error")
    }  
  } catch (error) {
    console.error(error);
  }
}

// create new chat
export const create =async (params:any) => { 
  const policy = params.policy;

  // Get the user details from the Mongodb
  const userIdObject = new ObjectId(params.userId);
  const userData = await getById(process.env.USERS_TABLE, { _id : userIdObject })

  // console.log(userData);

  const messages = [
    { role: 'system', content: 'You are a helpful assistant.'},
    { role: 'user', content: 'I am ' + userData.firstName + '!'}
  ]

  let data: any = {
    model: process.env.OPENAI_MODEL,
    userId: params.userId,
    messages: messages
  }  
  // console.log("Data Created")
  console.log(data)

  // Generate the first chat
  const result = await chat(data);

  // console.log("chat response recieved.")

  // Create mongodb record
  const lastMessageIndex = data.messages.length - 1;

  if (lastMessageIndex >= 0) {
    data.messages[lastMessageIndex].response = result.message;
  }

  // Create mongodb record
  const chatData = {
    model: data.model,
    conversationName: 'New Chat',
    messages: data.messages,
    user: data.userId,
  };

  let chatId;
  if (result.message) {
    // Save the conversation to 'chat_history' collection in MongoDB
    chatId = await save(chatData, process.env.CHAT_TABLE);
  }

  // Associate the chatId with the message object
  const messageWithChatId = {
    ...result.message,
    chatId: chatId || null, // Use null if chatId is not available
  };

  return {
    message: messageWithChatId,
  };
}

interface NewMessage {
  role: string;
  content: string;
  response?: any; // You can replace 'any' with the actual response type if available
}

// chat
export const chatUpdate =async (data:any) => {
  try {
    // Convert chatId string to ObjectId
    const chatIdObject = new ObjectId(data.chatId);
    // console.log(data.chatId)

    // Get the chat history by chat id from the mongodb
    const chatHistory = await getById(process.env.CHAT_TABLE, { _id: chatIdObject });
    // console.log(chatHistory)

    if (!chatHistory) {
      throw new Error(`Chat history not found for chatId: ${data.chatId}`);
    }

    let newMs : NewMessage= {
      role: data.role,
      content: data.content
    };

    // Prepare chatData without the response field in user messages
    const chatData = {
      model: chatHistory.model,
      messages: chatHistory.messages.map((message: any) => {
        if (message.role === 'user') {
          // Remove the response field from user messages
          const { response, ...userMessage } = message;
          return userMessage;
        }
        return message;
      })
    };

    // Add the new user message to chatData
    chatData.messages.push(newMs);
    // console.log(chatData)

    // Generate the statndard question
    // const paragraph = chatHistory.messages.map((message: { content: any; response: { message: { content: string; }; }; }) => {
    //   let content = message.content;
    //   if (message.response && message.response.message && message.response.message.content) {
    //     content += ' ' + message.response.message.content;
    //   }
    //   return content;
    // }).join(' ');

    const response = await generateStandardQuestion(chatHistory, newMs.content);
    if (response && response.content)
    {
      console.log("standard question" + response.content);

      // Generate embeddings
      const embeddingsData = await generateEmbedding(response.content);
      // console.log(embedding);
      

      // get the relevant document
      const embeddingsArray = embeddingsData.data.map(embeddingItem => embeddingItem.embedding).flat();
      const doc = await searchEmbeddings(embeddingsArray, process.env.FILE_CHUNKS)

      console.log(doc[0]._id)
      //Get the document by id
      const relevantDoc = await getById(process.env.FILE_CHUNKS, { _id : doc[0]._id})

      // Extract 'data' fields from each object in 'documentField' array
      const dataFields = relevantDoc.documentField.map((item: { data: any; }) => item.data);

      // Join 'data' fields into a single string
      const relevantContent = dataFields.join(' ');

      console.log(relevantContent)

      // create the converstaoin (standard question + document)
      const convData = {
        model: process.env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: relevantContent
          }, 
          {
            role: 'user',
            content: response.content
          }
        ]
      }

      console.log(convData)

      // Call the chat function using chatData
      const result = await chat(convData);

      // create the new message
      newMs.response = result;

      // Add the new message to the messages array of chatHistory
      chatHistory.messages.push(newMs);

      console.log(chatHistory)

      const updateCount = await update(process.env.CHAT_TABLE, { _id: chatHistory._id }, { messages: chatHistory.messages });

      console.log(updateCount)

      return result;
    } else {
      console.log('Error: creating data')
    }

  } catch (error) {
    console.error('Error during chat update:', error);
    throw error;
  }
}

// Get all the chats
export const getAllUserChats =async (userId: any) => {
  try {
    const data = await getAllChatHistoryForUser(process.env.CHAT_TABLE, userId);
    return { message: data }
  } catch (error) {
    console.error('Error during getting chat histories.. ')
    throw error;
  }
}

//Get one chat
export const getOneChat =async (id:any) => {
  try {
    // Convert chatId string to ObjectId
    const chatIdObject = new ObjectId(id);

    // Get the chat history by chat id from the mongodb
    const data = await getById(process.env.CHAT_TABLE, { _id: chatIdObject });
    return { message: data }
  } catch (error) {
    console.error('Error during getting chat histories.. ')
    throw error;
  }
}