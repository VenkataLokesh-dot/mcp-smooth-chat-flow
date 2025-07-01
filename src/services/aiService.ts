
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'openai' | 'gemini';
export type OpenAIModel = 'gpt-4.1-2025-04-14' | 'o3-2025-04-16' | 'o4-mini-2025-04-16' | 'gpt-4.1-mini-2025-04-14' | 'gpt-4o';
export type GeminiModel = 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-1.0-pro';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private currentProvider: AIProvider = 'openai';
  private currentModel: string = 'gpt-4.1-2025-04-14';

  initialize(provider: AIProvider, apiKey: string, model: string) {
    this.currentProvider = provider;
    this.currentModel = model;

    if (provider === 'openai') {
      this.openaiClient = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    } else if (provider === 'gemini') {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
  }

  async sendMessage(messages: Message[]): Promise<string> {
    if (this.currentProvider === 'openai') {
      return this.sendOpenAIMessage(messages);
    } else if (this.currentProvider === 'gemini') {
      return this.sendGeminiMessage(messages);
    }
    throw new Error('No AI provider initialized');
  }

  private async sendOpenAIMessage(messages: Message[]): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: this.currentModel,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      });

      return response.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async sendGeminiMessage(messages: Message[]): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ model: this.currentModel });
      
      // Convert messages to Gemini format
      const prompt = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || 'No response received';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isInitialized(): boolean {
    return (this.currentProvider === 'openai' && this.openaiClient !== null) ||
           (this.currentProvider === 'gemini' && this.geminiClient !== null);
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  updateModel(model: string) {
    this.currentModel = model;
  }
}

export const aiService = new AIService();
