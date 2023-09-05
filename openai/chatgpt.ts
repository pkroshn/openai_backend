
import { Configuration, CreateEmbeddingRequest, OpenAIApi } from "openai";
import 'dotenv/config';

const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration)

export const getModels =async () => {        
    const response = await openai.listModels()
    // console.log(response)
    // console.log(configuration)
    return response
}

export const getModel = async (modelId: string) => {
    const response = await openai.retrieveModel(modelId);
    // console.log(response)
    return response;
}

export const chat =async (params:any) => {
    try {
        const response = await openai.createChatCompletion({
          model: params.model,
          messages: params.messages,
          temperature: 0.7,
          max_tokens: 3000,
          user: params.userId,
        });
    
        if (
          response.data &&
          response.data.choices &&
          response.data.choices.length > 0 &&
          response.data.choices[0].message
        ) {
          return { message: response.data.choices[0].message };
        } else {
          throw new Error('Invalid response from OpenAI API');
        }
      } catch (error) {
        console.error('Error while processing chat:', error);
        throw new Error('Failed to generate chat completion');
      }
}

export const generateEmbedding = async (params: any) => {
  const request: CreateEmbeddingRequest = {
    model: 'davinci-codex',
    input: params.searchText,
    user: params.userId,
  };

  try {
    const response = await openai.createEmbedding(request);
    // return response.data[0].answers[0].text;
    console.log(response)
  } catch (error) {
    throw error;
  }
};


