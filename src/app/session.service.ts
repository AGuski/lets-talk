import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, ChatCompletionResponseMessage } from 'openai';
import { BehaviorSubject, Observable, Subject, Subscription, map, tap } from 'rxjs';
import { ChatMessage } from 'src/app/chat/chat-message.model';
import { DefaultChatTransformer } from 'src/app/conversation-transformers/default-chat.transformer';
import { Session } from 'src/interfaces/session';
import { v4 as uuidv4 } from 'uuid';

const newSessionTemplate = {
  id: 'NEW',
  name: 'New Session',
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

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  readonly serverUrl = 'http://localhost:3000';

  private currentSession = newSessionTemplate;

  private transformer = new DefaultChatTransformer();

  // private transformer = new OpenWorldTransformer();
  sessionStoringDebounceTimeout: undefined | NodeJS.Timeout = undefined;

  session$: BehaviorSubject<Session> = new BehaviorSubject(this.currentSession);
  tokenChange$: Subject<{usedTokens: number, usedUSD: number}> = new Subject();
  tokenizerSubscription: Subscription | undefined;

  constructor(private http: HttpClient) {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      this.loadSession(sessionId);
    }
  }

  updateCurrentSession(session: Partial<Session>): void {
    this.currentSession = {
      ...this.currentSession,
      ...session
    };
    this.debounceStoreCurrentSession();
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
    const uuid = uuidv4();
    this.currentSession.id = uuid;
    this.http.post<Session>(`${this.serverUrl}/store/${uuid}`, this.currentSession).subscribe(response => {
      console.log('Session stored: ', response.id);
      localStorage.setItem('sessionId', response.id as string);
    });
  }

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.serverUrl}/store`);
  }

  loadSession(sessionId: string): void {
    this.http.get<Session>(`${this.serverUrl}/store/${sessionId}`).subscribe(session => {
      this.currentSession = session;
      this.session$.next(session);
      localStorage.setItem('sessionId', session.id as string);
      console.log('Session loaded: ', session);
    });
  }

  storeCurrentSession(): void {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      this.http.put(`${this.serverUrl}/store/${sessionId}`, this.currentSession).subscribe(session => {
        console.log('Session updated');
      });
    } else {
      this.storeNewSession();
    }
  }

  deleteSession(sessionId: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.serverUrl}/store/${sessionId}`);
  }

  createSession(): Session {
    this.currentSession = newSessionTemplate;
    this.session$.next(this.currentSession);
    localStorage.removeItem('sessionId');
    return this.currentSession;
  }

  updateSessionName(sessionId: string, name: string): void {
    if (sessionId === this.currentSession.id) {
      this.updateCurrentSession({ name });
    }
    this.http.get<Session>(`${this.serverUrl}/store/${sessionId}`).subscribe(session => {
      this.http.put(`${this.serverUrl}/store/${sessionId}`, {
        ...session,
        name
      }).subscribe(session => {
        console.log('Session name updated');
      });
    });
  }

  private transformMessages(messages: ChatMessage[]): ChatCompletionRequestMessage[] {
    this.transformer.setSystemPrompt(this.currentSession.conversationSettings.systemPrompt);
    this.transformer.setMessageInjection(this.currentSession.conversationSettings);
    return this.transformer.transform(messages);
  }

  private debounceStoreCurrentSession() {
    if (this.sessionStoringDebounceTimeout) {
      clearTimeout(this.sessionStoringDebounceTimeout);
    }
    this.sessionStoringDebounceTimeout = setTimeout(() => {
      this.storeCurrentSession();
      this.sessionStoringDebounceTimeout = undefined;
    }, 1000);
  };
}
