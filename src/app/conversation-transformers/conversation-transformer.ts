import { ChatCompletionRequestMessage, ChatCompletionResponseMessage } from "openai";

export abstract class ConversationTransformer {
  abstract transformRequest(conversation: ChatCompletionRequestMessage[] ): ChatCompletionRequestMessage[];
  abstract transformResponse(response: ChatCompletionResponseMessage): ChatCompletionResponseMessage;
  abstract getSettings(): {[key: string]: any} | void
}
