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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = exports.chat = exports.getModel = exports.getModels = void 0;
const openai_1 = require("openai");
require("dotenv/config");
const configuration = new openai_1.Configuration({
    organization: process.env.OPENAI_ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
const getModels = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield openai.listModels();
    // console.log(response)
    // console.log(configuration)
    return response;
});
exports.getModels = getModels;
const getModel = (modelId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield openai.retrieveModel(modelId);
    // console.log(response)
    return response;
});
exports.getModel = getModel;
const chat = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield openai.createChatCompletion({
            model: params.model,
            messages: params.messages,
            temperature: 0.7,
            max_tokens: 3000,
            user: params.userId,
        });
        if (response.data &&
            response.data.choices &&
            response.data.choices.length > 0 &&
            response.data.choices[0].message) {
            return { message: response.data.choices[0].message };
        }
        else {
            throw new Error('Invalid response from OpenAI API');
        }
    }
    catch (error) {
        console.error('Error while processing chat:', error);
        throw new Error('Failed to generate chat completion');
    }
});
exports.chat = chat;
const generateEmbedding = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const request = {
        model: 'davinci-codex',
        input: params.searchText,
        user: params.userId,
    };
    try {
        const response = yield openai.createEmbedding(request);
        // return response.data[0].answers[0].text;
        console.log(response);
    }
    catch (error) {
        throw error;
    }
});
exports.generateEmbedding = generateEmbedding;
