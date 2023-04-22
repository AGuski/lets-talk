import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import { ChatRequest } from 'src/interfaces/chat-request';
import { GPTTokens } from 'gpt-tokens';
import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { OPENAI_API_KEY, PORT = 3000 } = process.env;

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Create a Keyv storage with JSON file
const storage = new Keyv({
  store: new KeyvFile({ filename: 'storage.json' }),
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

// Store an object and return the generated uuid
app.post('/store', async (req, res) => {
  const data = req.body;
  const uuid = uuidv4();
  await storage.set(uuid, data);
  res.status(201).json({ uuid });
});

// Retrieve an object by uuid
app.get('/store/:uuid', async (req, res) => {
  const uuid = req.params.uuid;
  const data = await storage.get(uuid);
  if (data === undefined) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.json(data);
  }
});

// Overwrite an object by uuid
app.put('/store/:uuid', async (req, res) => {
  const uuid = req.params.uuid;
  const data = req.body;
  const success = await storage.set(uuid, data);
  if (success) {
    res.json({ message: 'Updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete an object by uuid
app.delete('/store/:uuid', async (req, res) => {
  const uuid = req.params.uuid;
  const success = await storage.delete(uuid);
  if (success) {
    res.json({ message: 'Deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
