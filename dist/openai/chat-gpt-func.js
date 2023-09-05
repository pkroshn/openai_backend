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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneChat = exports.getAllUserChats = exports.chatUpdate = exports.create = void 0;
const chatgpt_1 = require("./chatgpt");
const mongoDb_1 = require("../services/mongoDb");
const mongodb_1 = require("mongodb");
function generateConversationName(messages) {
    // Extract keywords or phrases from messages
    const keywords = messages.flatMap((message) => message.content.split(' '));
    // Generate a conversation name using keywords
    if (keywords.length > 0) {
        const conversationName = keywords.join(' ');
        return conversationName;
    }
    else {
        return "Unnamed Conversation";
    }
}
// create new chat
const create = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const policy = params.policy;
    let data = {
        model: process.env.OPENAI_MODEL,
        userId: params.userId,
        messages: params.messages
    };
    console.log(data);
    // Generate the first chat
    const result = yield (0, chatgpt_1.chat)(data);
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
        chatId = yield (0, mongoDb_1.save)(chatData, process.env.CHAT_TABLE);
    }
    // Associate the chatId with the message object
    const messageWithChatId = Object.assign(Object.assign({}, result.message), { chatId: chatId || null });
    return {
        message: messageWithChatId,
    };
});
exports.create = create;
// chat
const chatUpdate = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Convert chatId string to ObjectId
        const chatIdObject = new mongodb_1.ObjectId(data.chatId);
        console.log(data.chatId);
        // Get the chat history by chat id from the mongodb
        const chatHistory = yield (0, mongoDb_1.getById)(process.env.CHAT_TABLE, { _id: chatIdObject });
        console.log(chatHistory);
        if (!chatHistory) {
            throw new Error(`Chat history not found for chatId: ${data.chatId}`);
        }
        let newMs = {
            role: data.role,
            content: data.content
        };
        // Prepare chatData without the response field in user messages
        const chatData = {
            model: chatHistory.model,
            messages: chatHistory.messages.map((message) => {
                if (message.role === 'user') {
                    // Remove the response field from user messages
                    const { response } = message, userMessage = __rest(message, ["response"]);
                    return userMessage;
                }
                return message;
            })
        };
        // Add the new user message to chatData
        chatData.messages.push(newMs);
        // Call the chat function using chatData
        const result = yield (0, chatgpt_1.chat)(chatData);
        // create the new message
        newMs.response = result;
        // Add the new message to the messages array of chatHistory
        chatHistory.messages.push(newMs);
        console.log(chatHistory);
        const updateCount = yield (0, mongoDb_1.update)(process.env.CHAT_TABLE, { _id: chatHistory._id }, { messages: chatHistory.messages });
        console.log(updateCount);
        return result;
    }
    catch (error) {
        console.error('Error during chat update:', error);
        throw error;
    }
});
exports.chatUpdate = chatUpdate;
// Get all the chats
const getAllUserChats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, mongoDb_1.getAllChatHistoryForUser)(process.env.CHAT_TABLE, userId);
        return { message: data };
    }
    catch (error) {
        console.error('Error during getting chat histories.. ');
        throw error;
    }
});
exports.getAllUserChats = getAllUserChats;
//Get one chat
const getOneChat = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Convert chatId string to ObjectId
        const chatIdObject = new mongodb_1.ObjectId(id);
        // Get the chat history by chat id from the mongodb
        const data = yield (0, mongoDb_1.getById)(process.env.CHAT_TABLE, { _id: chatIdObject });
        return { message: data };
    }
    catch (error) {
        console.error('Error during getting chat histories.. ');
        throw error;
    }
});
exports.getOneChat = getOneChat;
