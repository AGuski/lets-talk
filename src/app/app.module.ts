import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbAlertModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ChatComponent } from './chat/chat.component';
import { AutogrowDirective } from './autogrow.directive';
import { ModelSettingsComponent } from './model-settings/model-settings.component';
import { TokenizerInfoComponent } from './tokenizer-info/tokenizer-info.component';
import { MessageSettingsComponent } from './message-settings/message-settings.component';
import { SpeechSettingsComponent } from './speech-settings/speech-settings.component';
import { SessionSelectorComponent } from './session-selector/session-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    AutogrowDirective,
    ModelSettingsComponent,
    TokenizerInfoComponent,
    MessageSettingsComponent,
    SpeechSettingsComponent,
    SessionSelectorComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbAlertModule,
    NgbDropdownModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
