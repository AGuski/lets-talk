import { ChatMessage } from 'src/app/chat/chat-message.model';
import { MessageInjectionConfig } from './message-injection-config';

export interface Session {
  id: string;
  name: string;
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  conversationSettings: {
    systemPrompt: string
  } & MessageInjectionConfig;
}
