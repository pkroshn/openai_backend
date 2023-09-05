import { chat } from './chatgpt';
import { getAll, getAllChatHistoryForUser, getById, save, update } from '../services/mongoDb';
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

// create new chat
export const create =async (params:any) => { 
  const policy = params.policy;
  let data: any = {
    model: process.env.OPENAI_MODEL,
    userId: params.userId,
    messages: params.messages
  }  

  console.log(data)
  // Generate the first chat
  const result = await chat(data);

  // Create mongodb record
  const lastMessageIndex = data.messages.length - 1;
  if (lastMessageIndex >= 0) {
    data.messages[lastMessageIndex].response = result.message;
  }

  // Create mongodb record
  const chatData = {
    model: data.model,
    conversationName: generateConversationName(data.messages),
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
    console.log(data.chatId)

    // Get the chat history by chat id from the mongodb
    const chatHistory = await getById(process.env.CHAT_TABLE, { _id: chatIdObject });
    console.log(chatHistory)

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

    // Call the chat function using chatData
    const result = await chat(chatData);

    // create the new message
    newMs.response = result;

    // Add the new message to the messages array of chatHistory
    chatHistory.messages.push(newMs);

    console.log(chatHistory)

    const updateCount = await update(process.env.CHAT_TABLE, { _id: chatHistory._id }, { messages: chatHistory.messages });

    console.log(updateCount)

    return result;

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