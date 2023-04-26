import { Component } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rpg-gpt';

  constructor() {}

  toggleMessageSettings() {}

  // openSessions() {
  //   const offcanvasRef = this.offcanvasService.open(SessionOffCanvasComponent);
	// 	offcanvasRef.componentInstance.name = 'World';
  // }

  selectSession(event: MouseEvent, dropdown: NgbDropdown) {
    console.log('selectSession');
    dropdown.close();
  }

  trashSession(event: MouseEvent) {
    event.stopPropagation();
    console.log('trashSession');
  }
}
