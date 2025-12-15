import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
    provider: process.env.LLM_PROVIDER ?? 'gemini',
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
}));
