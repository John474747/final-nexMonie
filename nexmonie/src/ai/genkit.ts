import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Ensure environment variables are loaded if not already
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
