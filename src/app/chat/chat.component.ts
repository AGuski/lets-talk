import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatMessage } from 'src/app/chat/chat-message.model';
import { SessionService } from 'src/app/session.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  @ViewChild('messageList', { static: false }) private messageList!: ElementRef;
  messageInput = '';
  messages!: ChatMessage[];

  hoveredMessage: number | undefined;

  waitingForResponse = false;

  constructor(private sessionService: SessionService) { }

  ngOnInit() {
    this.sessionService.session$.subscribe(session => {
      this.messages = session.messages;
      this.scrollToBottom();
    });
  }

  sendMessage(event: Event) {
    event.preventDefault();
    this.messages.push({ role: 'user', text: '', editing: false });
    this.waitingForResponse = true;
    this.scrollToBottom();
    this.sessionService.chat(this.messages).subscribe((response) => {
      this.messages.splice(-1, 0, response);
      this.onMessagesChange();
      this.waitingForResponse = false;
      this.scrollToBottom();
      this.sessionService.updateTokenUsage();
    });

    // for testing

    // setTimeout(() => {
    //   this.messages.splice(-1,0,{ role: 'assistant', text: 'hello back!', editing: false });
    //   this.scrollToBottom();
    //   this.onMessagesChange();
    // }, 1000);
  }

  editMessage(message: ChatMessage) {
    message.editing = !message.editing;
  }

  hoverMessage(messageIndex?: number) {
    this.hoveredMessage = messageIndex;
  }

  finishEditing(event: Event, message: ChatMessage) {
    event.preventDefault();
    message.editing = false;
  }

  removeMessage(message: ChatMessage) {
    const index = this.messages.indexOf(message);
    if (index > -1) {
      this.messages.splice(index, 1);
    }
    this.onMessagesChange();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    });
  }

  onMessagesChange() {
    this.sessionService.updateSession({ messages: this.messages });
  }
}
