import {SpeechClient} from '@google-cloud/speech';


export class SpeechToTextTranscriber {
  
  client = new SpeechClient();
  recognizeStream: any;

  constructor() {
    const request = {
      config: {
        encoding: 'LINEAR16' as 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'US-en',
      },
      interimResults: true
    }
  
    this.recognizeStream = this.client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data =>
      process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : '\n\nReached transcription time limit, press Ctrl+C\n'
      )
    );
  }

  write(data: any) {
    this.recognizeStream.write(Buffer.from(data));
  }

  end() {
    this.recognizeStream.end();
  }
}
