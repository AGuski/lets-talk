import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import RecordRTC from 'recordrtc';
import { ChatMessage } from 'src/app/chat/chat-message.model';
import { SessionService } from 'src/app/session.service';

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

  socket = new WebSocket('ws://localhost:5000');

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.sessionService.session$.subscribe((session) => {
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
      this.messageList.nativeElement.scrollTop =
        this.messageList.nativeElement.scrollHeight;
    });
  }

  onMessagesChange() {
    this.sessionService.updateCurrentSession({ messages: this.messages });
  }

  async recordAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioContext = new AudioContext();
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    const scriptProcessorNode = audioContext.createScriptProcessor(4096, 1, 1);
    
    mediaStreamSource.connect(scriptProcessorNode);
    scriptProcessorNode.connect(audioContext.destination);
    
    scriptProcessorNode.onaudioprocess = audioProcessingEvent => {
      const buffer = audioProcessingEvent.inputBuffer.getChannelData(0);
      const pcmData = convertFloat32ToInt16(buffer);
      this.socket.send(pcmData);
    };
    
    function convertFloat32ToInt16(buffer: Float32Array) {
      let l = buffer.length;
      let buf = new Int16Array(l);
    
      while (l--) {
        buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
      }
      return buf.buffer;
    }

    setTimeout(() => {
      console.log('stopRec');
      this.socket.close();
    }, 5000);



    // const recordRTC = new RecordRTC(stream, {
    //   type: 'audio',
    //   timeSlice: 1000,
    //   ondataavailable: (blob) => {
    //     console.log('send');
    //     this.socket.send(blob);
    //   },
    // });
    // console.log('startRec');
    // recordRTC.startRecording();

    // setTimeout(() => {
    //   console.log('stopRec');
    //   recordRTC.stopRecording();
    //   this.socket.close();
    // }, 5000);
  }
}
