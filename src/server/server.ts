import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import { ChatRequest } from "src/interfaces/chat-request";
import { GPTTokens } from "gpt-tokens";
import Keyv from "keyv";
import { KeyvFile } from "keyv-file";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";
import { SpeechClient } from '@google-cloud/speech';
dotenv.config();



export class SpeechToTextTranscriber {
  
  client = new SpeechClient();
  recognizeStream;

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
    .on('error', console.error)
    .on('data', data => {
      console.log(data);
      console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`);
    });
  }

  write(data: ArrayBufferLike) {
    this.recognizeStream.write(Buffer.from(data));
  }

  end() {
    this.recognizeStream.end();
  }
}


const { OPENAI_API_KEY, PORT = 3000 } = process.env;

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const wss = new WebSocketServer({ port: 5000 });

const transcriber = new SpeechToTextTranscriber();
wss.on('connection', (socket) => {
  socket.on('message', (data: ArrayBufferLike) => {
    console.log('msg');
    transcriber.write(data);
  });
  // Process the received audio data
  socket.on('close', () => {
    console.log('close');
    transcriber.end();
  });
});

const keyvFile = new KeyvFile({ filename: 'storage.json' });

// Create a Keyv storage with JSON file
const storage = new Keyv({
  store: keyvFile,
});

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware for handling errors
const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ error: err.message });
};

// Generate chat completion
app.post(
  '/completion',
  async (req: Request, res: Response, next: NextFunction) => {
    const { model, messages, temperature, max_tokens }: ChatRequest = req.body;
    console.log('Request Data:', req.body);
    try {
      const completion = await openai.createChatCompletion({
        model,
        temperature: temperature || 0.5,
        max_tokens: max_tokens || 100,
        messages,
      });
      console.log('Response Data:', completion.data);
      res.json(completion.data.choices[0].message);
    } catch (error) {
      next(error);
    }
  }
);

// Tokenize and calculate usage
app.post(
  '/tokenize',
  async (req: Request, res: Response, next: NextFunction) => {
    const { model, messages } = req.body;
    const usageInfo = new GPTTokens({
      model: model,
      messages: messages,
    });
    res.json({
      usedTokens: usageInfo.usedTokens,
      usedUSD: usageInfo.usedUSD,
    });
  }
);

// Store an object and return it.
app.post('/store/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  await storage.set(id, data);
  res.status(201).json(data);
});

// Retrieve an object by id
app.get('/store/:id', async (req, res) => {
  const id = req.params.id;
  const data = await storage.get(id);
  if (data === undefined) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.json(data);
  }
});

// Overwrite an object by id
app.put('/store/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const success = await storage.set(id, data);
  if (success) {
    res.json({ message: 'Updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete an object by id
app.delete('/store/:id', async (req, res) => {
  const id = req.params.id;
  const success = await storage.delete(id);
  if (success) {
    res.json({ message: 'Deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Retrieve al stored objects
app.get('/store', async (req, res) => {
  const keys = await keyvFile
    .keys()
    .map((key: string) => key.replace('keyv:', ''));
  const data = await Promise.all(
    keys.map(async (key: string) => await storage.get(key))
  );
  res.json(data);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
// server.on('upgrade', (request, socket, head) => {
//   wsServer.handleUpgrade(request, socket, head, socket => {
//     wsServer.emit('connection', socket, request);
//   });
// });
