import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, ChatCompletionResponseMessage } from 'openai';
import { BehaviorSubject, Observable, Subject, Subscription, map } from 'rxjs';
import { ChatMessage } from 'src/app/chat/chat-message.model';
import { DefaultChatTransformer } from 'src/app/conversation-transformers/default-chat.transformer';
import { Session } from 'src/interfaces/session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  readonly serverUrl = 'http://localhost:3000';

  private currentSession = {
    id: '1',
    model: 'gpt-3.5-turbo',
    temperature: 0.9,
    max_tokens: 1000,
    conversationSettings: {
      systemPrompt: 'You are a helpful AI Chat assistant. Keep your answers short.',
      useMessageInjection: false,
      injectionPrompt: '',
      injectionDepth: 1,
      injectionRole: 'user' as ChatCompletionRequestMessageRoleEnum
    },
    messages: [
      { role: 'user', text: '', editing: false },
    ]
  };

  private transformer = new DefaultChatTransformer();

  // private transformer = new OpenWorldTransformer();
  sessionStoringDebounceTimeout: undefined | NodeJS.Timeout = undefined;

  session$: BehaviorSubject<Session> = new BehaviorSubject(this.currentSession);
  tokenChange$: Subject<{usedTokens: number, usedUSD: number}> = new Subject();
  tokenizerSubscription: Subscription | undefined;

  constructor(private http: HttpClient) {
    this.retrieveSession();
  }

  updateSession(session: Partial<Session>): void {
    this.currentSession = {
      ...this.currentSession,
      ...session
    };
    this.debounceStoreSession();
    this.session$.next(this.currentSession);
  }

  chat(messages: ChatMessage[]): Observable<ChatMessage> {
    const payloadMessages = this.transformMessages(messages);
    console.log('Payload messages: ', payloadMessages);
    const response$ = this.http.post<ChatCompletionResponseMessage>(this.serverUrl+'/completion', {
      model: this.currentSession.model,
      temperature: this.currentSession.temperature,
      max_tokens: this.currentSession.max_tokens,
      messages: payloadMessages
    }).pipe(map(response => this.transformer.transformResponse(response)));
    return response$;
  }

  getTokenUsage(): Observable<{usedTokens: number, usedUSD: number}> {
    return this.http.post<{usedTokens: number, usedUSD: number}>(this.serverUrl+'/tokenize', {
      model: this.currentSession.model,
      messages: this.transformMessages(this.currentSession.messages)
    });
  }

  updateTokenUsage(): void {
    this.tokenizerSubscription?.unsubscribe();
    this.tokenizerSubscription = this.getTokenUsage().subscribe(tokenizer => {
      this.tokenChange$.next({
        usedTokens: tokenizer.usedTokens,
        usedUSD: tokenizer.usedUSD
      });
    });
  };

  storeNewSession(): void {
    this.http.post<{uuid: string}>(`${this.serverUrl}/store`, this.currentSession).subscribe(response => {
      console.log('Session stored: ', response.uuid);
      localStorage.setItem('sessionId', response.uuid as string);
    });
  }

  retrieveSession(): void {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      this.http.get<Session>(`${this.serverUrl}/store/${sessionId}`).subscribe(session => {
        console.log('Session retrieved: ', session);
        this.currentSession = session;
        this.session$.next(session);
      });
    }
  }

  updateStoredSession(): void {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      this.http.put(`${this.serverUrl}/store/${sessionId}`, this.currentSession).subscribe(session => {
        console.log('Session updated');
      });
    } else {
      this.storeNewSession();
    }
  }

  private transformMessages(messages: ChatMessage[]): ChatCompletionRequestMessage[] {
    this.transformer.setSystemPrompt(this.currentSession.conversationSettings.systemPrompt);
    this.transformer.setMessageInjection(this.currentSession.conversationSettings);
    return this.transformer.transform(messages);
  }

  private debounceStoreSession() {
    if (this.sessionStoringDebounceTimeout) {
      clearTimeout(this.sessionStoringDebounceTimeout);
    }
    this.sessionStoringDebounceTimeout = setTimeout(() => {
      this.updateStoredSession();
      this.sessionStoringDebounceTimeout = undefined;
    }, 1000);
  };
}
