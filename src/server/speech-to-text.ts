import { SpeechClient } from '@google-cloud/speech';
import { Observable, Subject } from 'rxjs';

// TODO: Long running transcription, as it now resets after a sentence or so...

export class SpeechToTextTranscriber {
  
  client = new SpeechClient();
  recognizeStream;

  transcription$ = new Subject<string>();

  constructor() {
    const request = {
      config: {
        encoding: 'LINEAR16' as 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
      interimResults: true
    }
  
    this.recognizeStream = this.client.streamingRecognize(request)
    .on('error', error => {
      console.log('error', error);
    })
    .on('data', data => {
      console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`);
      this.transcription$.next(data.results[0].alternatives[0].transcript);
    });
  }

  write(data: ArrayBufferLike) {
    // console.log(data);
    this.recognizeStream.write(Buffer.from(data));
  }

  end() {
    this.recognizeStream.end();
  }

  onTranscribe(): Observable<string> {
    return this.transcription$.asObservable();
  }
}