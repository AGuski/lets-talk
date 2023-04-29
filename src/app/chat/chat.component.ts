import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Subscription, concatMap, of, tap } from 'rxjs';
import { ChatMessage } from 'src/app/chat/chat-message.model';
import { SessionService } from 'src/app/session.service';
import { SpeechService } from 'src/app/speech.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @ViewChild('messageList', { static: false }) private messageList!: ElementRef;
  messageInput = '';
  messages!: ChatMessage[];

  hoveredMessage: number | undefined;

  waitingForResponse = false;
  isRecording = false;
  sttSubscription: Subscription | undefined;

  constructor(
    private sessionService: SessionService,
    private speechService: SpeechService
  ) {}

  ngOnInit() {
    this.sessionService.session$.pipe(
      concatMap((value, index) => index === 0
        ? of(value).pipe(
            tap(() => this.scrollToBottom()),
          )
        : of(value)
      )
    ).subscribe((session) => {
      this.messages = session.messages;
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
      this.messageList.nativeElement.scrollTop =
        this.messageList.nativeElement.scrollHeight;
    });
  }

  onMessagesChange() {
    this.sessionService.updateCurrentSession({ messages: this.messages });
  }

  toggleRecording() {
    if (!this.isRecording) {
      this.sttSubscription = this.speechService.onTranscription().subscribe((transcription) => {
        this.messages[this.messages.length - 1].text = transcription;
      });
      this.speechService.startSTTRecording();
    } else {
      this.speechService.stopSTTRecording();
      this.sttSubscription?.unsubscribe();
    }
    this.isRecording = !this.isRecording;
  }
}
