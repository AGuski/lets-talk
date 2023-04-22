import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, ChatCompletionResponseMessage } from 'openai';
import { ChatMessage } from 'src/app/chat/chat-message.model';
import { MessageInjectionConfig } from 'src/interfaces/message-injection-config';

export class DefaultChatTransformer {

  messageInjectionConfig: MessageInjectionConfig = {
    useMessageInjection: false,
    injectionPrompt: '',
    injectionDepth: 1,
    injectionRole: 'user'
  }

  constructor(private systemPrompt?: string) {}

  setSystemPrompt(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  setMessageInjection(messageInjectionConfig: Partial<MessageInjectionConfig>): void {
    this.messageInjectionConfig = {
      ...this.messageInjectionConfig,
      ...messageInjectionConfig
    };
  }

  transform(messages: ChatMessage[]): ChatCompletionRequestMessage[] {
    messages = messages.filter(message => message.text.trim() !== '');
    const chatCompletionMessages = messages.map(message => {
      return {
        content: message.text.trim(),
        role: message.role as 'user' | 'assistant' | 'system'
      }
    });

    if (this.systemPrompt) {
      chatCompletionMessages.unshift({
        content: this.systemPrompt,
        role: 'system'
      });
    }

    const { useMessageInjection, injectionPrompt, injectionRole, injectionDepth} = this.messageInjectionConfig;

    if (useMessageInjection) {
      const injectionMessage = {
        content: injectionPrompt,
        role: injectionRole as ChatCompletionRequestMessageRoleEnum
      };
      chatCompletionMessages.splice(-injectionDepth, 0, injectionMessage);
    }

    return chatCompletionMessages;
  }

  transformResponse(response: ChatCompletionResponseMessage): ChatMessage {
    return {role: response.role, text: response.content, editing: false};
  }
}
