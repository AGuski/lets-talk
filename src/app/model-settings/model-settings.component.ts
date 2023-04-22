import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/session.service';

@Component({
  selector: 'app-model-settings',
  templateUrl: './model-settings.component.html',
  styleUrls: ['./model-settings.component.scss']
})
export class ModelSettingsComponent implements OnInit {
  model: string = 'gpt-3.5-turbo';
  temperature: number = 0.9;
  maxResponseLength: number = 100;

  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {
    this.sessionService.session$.subscribe(session => {
      this.model = session.model;
      this.temperature = session.temperature;
      this.maxResponseLength = session.max_tokens;
    });
  }

  onModelChange(value: string): void {
    this.model = value;
    this.sessionService.updateSession({
      model: this.model
    });
  }

  onTemperatureChange(value: number): void {
    this.temperature = value;
    this.sessionService.updateSession({
      temperature: this.temperature
    });
  }

  onMaxResponseLengthChange(value: number): void {
    this.maxResponseLength = value;
    this.sessionService.updateSession({
      max_tokens: this.maxResponseLength
    });
  }
}
