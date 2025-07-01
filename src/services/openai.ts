
import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI | null = null;
  private model: string = 'gpt-4.1-2025-04-14';

  initialize(apiKey: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.model = model;
  }

  async sendMessage(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please set your API key.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      });

      return response.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error) {
        throw new Error(`OpenAI Error: ${error.message}`);
      }
      throw new Error('Failed to get response from OpenAI');
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  updateModel(model: string) {
    this.model = model;
  }
}

export const openAIService = new OpenAIService();
