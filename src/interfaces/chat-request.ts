import { ChatCompletionRequestMessage } from 'openai';

export interface ChatRequest {
  model: string;
  messages: ChatCompletionRequestMessage[];
  temperature?: number;
  max_tokens?: number;
}