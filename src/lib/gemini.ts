import { GoogleGenAI, Type } from '@google/genai';
import { StravaRecord } from '../types';

export const extractStravaData = async (base64Image: string, mimeType: string): Promise<StravaRecord[]> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error("API Key Gemini belum diatur. Silakan masukkan GEMINI_API_KEY di menu Secrets (ikon kunci) di AI Studio.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview', // Updated to latest pro model
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        'Extract the leaderboard data from this Strava screenshot. Return a JSON array of objects, where each object has "stravaName" (string) and "distance" (number, extracted from "XX.X km"). Do not include any markdown formatting or other text, just the JSON array.',
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stravaName: {
                type: Type.STRING,
                description: 'The name of the athlete as shown in the screenshot',
              },
              distance: {
                type: Type.NUMBER,
                description: 'The distance in km as a number (e.g., 29.4)',
              },
            },
            required: ['stravaName', 'distance'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from AI');
    
    const data = JSON.parse(text) as StravaRecord[];
    return data;
  } catch (error: any) {
    console.error('Error extracting data with Gemini:', error);
    // Format error message to be more readable
    if (error.message?.includes('API key not valid')) {
      throw new Error("API Key Gemini tidak valid. Pastikan GEMINI_API_KEY di menu Secrets sudah benar.");
    }
    throw error;
  }
};
