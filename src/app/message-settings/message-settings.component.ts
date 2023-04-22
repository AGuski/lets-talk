import { Component, OnInit } from '@angular/core';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { SessionService } from 'src/app/session.service';
import { MessageInjectionConfig } from 'src/interfaces/message-injection-config';

@Component({
  selector: 'app-message-settings',
  templateUrl: './message-settings.component.html',
  styleUrls: ['./message-settings.component.scss']
})
export class MessageSettingsComponent implements OnInit {

  systemPrompt = '';
  collapsed = true;

  messageInjectionConfig!: MessageInjectionConfig;

  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {
    this.sessionService.session$.subscribe(session => {
      this.systemPrompt = session.conversationSettings.systemPrompt;
      this.messageInjectionConfig = {
        useMessageInjection: session.conversationSettings.useMessageInjection,
        injectionDepth: session.conversationSettings.injectionDepth,
        injectionRole: session.conversationSettings.injectionRole,
        injectionPrompt: session.conversationSettings.injectionPrompt
      }
    });
  }

  toggleSettings() {
    this.collapsed = !this.collapsed;
  }

  onSystemPromptChange(value: string): void {
    this.systemPrompt = value;

    this.sessionService.updateSession({
      conversationSettings: {
        ...this.sessionService.session$.value.conversationSettings,
        systemPrompt: this.systemPrompt
      }
    });
  }

  onInjectionDepthChange(value: number): void {
    this.messageInjectionConfig.injectionDepth = value;
    this.updateSessionWithProperty({
      injectionDepth: this.messageInjectionConfig.injectionDepth
    });
  }

  onInjectionRoleChange(value: string): void {
    this.messageInjectionConfig.injectionRole = value as ChatCompletionRequestMessageRoleEnum;
    this.updateSessionWithProperty({
      injectionRole: this.messageInjectionConfig.injectionRole
    });
  }

  onInjectionPromptChange(value: string): void {
    this.messageInjectionConfig.injectionPrompt = value;
    this.updateSessionWithProperty({
      injectionPrompt: this.messageInjectionConfig.injectionPrompt
    });
  }

  onUseMessageInjectionChange(value: boolean): void {
    this.messageInjectionConfig.useMessageInjection = value;
    this.updateSessionWithProperty({
      useMessageInjection: this.messageInjectionConfig.useMessageInjection
    });
  }

  updateSessionWithProperty(config: Partial<MessageInjectionConfig>) {
    this.sessionService.updateSession({
      conversationSettings: {
        ...this.sessionService.session$.value.conversationSettings,
        ...config
      }
    });
  }
}
