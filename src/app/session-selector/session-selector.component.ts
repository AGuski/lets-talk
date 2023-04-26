import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { SessionService } from 'src/app/session.service';
import { Session } from 'src/interfaces/session';

@Component({
  selector: 'app-session-selector',
  templateUrl: './session-selector.component.html',
  styleUrls: ['./session-selector.component.scss']
})
export class SessionSelectorComponent implements OnInit{

  currentSession: Session | null = null;

  sessions: Session[] = [];
  
  editedSession = null;
  @ViewChild('sessionNameInput') editedSessionInput!: ElementRef<HTMLInputElement>;

  constructor(private sessionService: SessionService) { }

  ngOnInit() {
    this.sessionService.getAllSessions().subscribe((sessions) => {
      this.sessions = sessions;
    });
    this.sessionService.session$.subscribe((session) => {
      console.log('sub Sessionsevice', session);
      this.currentSession = session;
    });
  }

  selectSession(event: MouseEvent, dropdown: NgbDropdown, session: any) {
    this.sessionService.loadSession(session.id);
    dropdown.close();
  }

  trashSession(event: MouseEvent, session: any) {
    event.stopPropagation();
    this.sessionService.deleteSession(session.id).subscribe(() => {
      this.sessions = this.sessions.filter((s) => s.id !== session.id);
      if(this.currentSession?.id === session.id) {
        this.createNewSession();
      }
    });
  }

  editSessionName(event: MouseEvent, session: any) {
    event.stopPropagation();
    this.editedSession = session.id;
    setTimeout(() => {
      this.editedSessionInput.nativeElement.focus();
    },0);
  }

  updateSessionName(event: any, session: any) {
    event.stopPropagation();
    if (event.key === 'Enter' || event.type === 'focusout') {
      session.editMode = false;
      this.editedSession = null;
      // TODO: solve case when session has no ID yet
      this.sessionService.updateSessionName(session.id, session.name);
    }
  }

  createNewSession() {
    const newSession = this.sessionService.createSession();
    this.sessions.push(newSession);
  }

}
