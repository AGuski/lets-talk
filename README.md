# Let's talk

A server and web client UI for an ever expanding set of features around OpenAI's GPT ChatCompletion API. Powered by Node.js, Angular, and the OpenAI API.


## Development server

Right now there is only a development server. To run it, you will need to have Node.js installed. 

Run `npm install` to install the dependencies. 

Then, run `npm run start:server` to start the server. 

Then, in a separate terminal, run `npm start` to start the client. 

The client will be available at `http://localhost:4200/`. The server will be available at `http://localhost:3000/`. The server will automatically reload if you change any of the source files.

## Current Features

- Basic chat conversations
- Session/Conversation management (Buggy)
- Basic model settings (model, temperature, max tokens)
- A Tokenizer that gives a rough estimation what the last completion cost and how many tokens it used.
- Google Cloud Speech to Text integration (requires a Google Cloud account and a service account key)
- Parsing of Markup in the messages (messes up the margins...)

## Setting up the env
A `.env` file is required in the root directory of the project. It should contain the following variables:

```shell
OPENAI_API_KEY=<your openai api key>
// If you want to use the Google Cloud Speech to Text integration:
GOOGLE_APPLICATION_CREDENTIALS=<path to your google cloud service account key>

```

## Session Management

Sessions (or conversations) will be stored via keyv in a `storage.json` file and persist.
The web app will store the current session in local storage and will load it on page load.

Session management is somewhat buggy right now, but it works.


