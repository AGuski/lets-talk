import { Injectable, OnDestroy } from "@angular/core";

import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class SpeechService implements OnDestroy {
  private currentTranscription$ = new Subject<string>();
  private socket: WebSocket | undefined;
  private recordRTC: RecordRTC | undefined;

  constructor() {}

  ngOnDestroy() {
    if (this.socket) {
      this.socket.close();
    }
    if (this.recordRTC) {
      this.recordRTC.stopRecording();
    }
  }

  stopSTTRecording() {
    console.log("stopRec");
    this.recordRTC!.stopRecording();
    this.socket!.close();
  }

  async startSTTRecording() {
    try {
      console.log("startRec");
      this.socket = new WebSocket("ws://localhost:5000");

      this.socket.onmessage = (event) => {
        this.currentTranscription$.next(event.data);
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.recordRTC = new RecordRTC(mediaStream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        timeSlice: 500,
        ondataavailable: (blob) => {
          this.socket!.send(blob);
        },
      });

      this.recordRTC.startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }

  onTranscription(): Observable<string> {
    return this.currentTranscription$.asObservable();
  }
}
