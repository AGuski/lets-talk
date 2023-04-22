import { ChatCompletionRequestMessage, ChatCompletionResponseMessage } from "openai";
import { ConversationTransformer } from "./conversation-transformer";

export class DefaultTransformer extends ConversationTransformer {
  transformRequest(conversation: ChatCompletionRequestMessage[]): ChatCompletionRequestMessage[] {
    conversation = conversation.filter(message => message.content.trim() !== '');
    return conversation;
  }

  transformResponse(response: ChatCompletionResponseMessage): ChatCompletionResponseMessage {
    return response;
  }

  getSettings(): void {}
}
