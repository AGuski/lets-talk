import { ChatCompletionRequestMessage, ChatCompletionResponseMessage } from "openai";
import { ConversationTransformer } from "./conversation-transformer";

export class DefaultTransformer extends ConversationTransformer {

  constructor(private systemPrompt: string = '') {
    super();
  }

  transformRequest(conversation: ChatCompletionRequestMessage[]): ChatCompletionRequestMessage[] {
    if (this.systemPrompt) {
      conversation.unshift({
        content: this.systemPrompt,
        role: 'system'
      });
    }
    return conversation;
  }

  transformResponse(response: ChatCompletionResponseMessage): ChatCompletionResponseMessage {
    return response;
  }

  setSystemPrompt(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  getSettings() {
    return { systemPrompt: this.systemPrompt}
  }
}
