import { ChatCompletionRequestMessageRoleEnum } from "openai";

export interface MessageInjectionConfig {
  useMessageInjection: boolean;
  injectionPrompt: string;
  injectionDepth: number;
  injectionRole: ChatCompletionRequestMessageRoleEnum;
}
