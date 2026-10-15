# InterviewIQ.AI

InterviewIQ.AI is a React and Express application for practicing job interviews with an AI interviewer. Users can choose an interview type, answer questions with their keyboard or microphone, and review interview feedback.

## Features

- Google sign-in through Firebase.
- Continue as Guest without an email, password, or Google account.
- Technical, HR, Behavioral, System Design, Coding, and Mixed interview types.
- Optional PDF resume analysis.
- Voice input with the browser Speech Recognition API.
- Spoken questions with the browser Speech Synthesis API.
- AI-generated interview questions and answer evaluation through OpenRouter.
- Interview history, progress statistics, downloadable reports, and Razorpay credit plans when the backend is configured.
- Guest session persistence in `localStorage`, so a refresh keeps the current browser session.

Guest mode is a client-side session. It does not create a database user or bypass server authentication. AI generation, resume analysis, answer evaluation, cloud history, and payments still require the Express backend, MongoDB, and their related service credentials. The app shows a clear message when one of those services is unavailable.

## Technologies

### Client

- React 19 and Vite
- React Router
- Redux Toolkit and React Redux
- Tailwind CSS
- Firebase Authentication
- Axios
- Motion, React Icons, Recharts, jsPDF, and Razorpay Checkout

### Server

- Node.js with Express
- MongoDB with Mongoose
- JWT stored in an HTTP-only cookie
- OpenRouter for AI requests
- Firebase on the client for Google sign-in
- Razorpay for payments
- PDF.js and Multer for resume uploads

## Project structure

```text
client/
  src/
    components/       Interview setup, interview flow, reports, and navigation
    pages/            Home, authentication, history, pricing, and report pages
    redux/            Redux store and user state
    utils/            Firebase setup and guest-session helpers
  public/             Public images
  .env.example        Client environment variable template

server/
  config/             Environment and database configuration
  controllers/        Authentication, interview, user, and payment logic
  middlewares/        Authentication and file-upload middleware
  models/             Mongoose models
  routes/             Express API routes
  services/           OpenRouter and Razorpay integrations
  .env.example        Server environment variable template
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB for the server
- An OpenRouter API key for AI features
- Firebase project credentials for Google sign-in
- Razorpay credentials only if paid credit plans are used

## Installation

Clone the repository and install dependencies in both applications:

```bash
git clone <your-repository-url>
cd "AI Interview Agent"

cd client
npm install

cd ../server
npm install
```

Create the environment files:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

On macOS or Linux, use `cp` instead of `copy`.

### Client environment

Set these values in `client/.env`:

- `VITE_API_URL`: the URL of the Express server, such as `http://localhost:6000`
- `VITE_FIREBASE_*`: Firebase web app and Google Authentication settings
- `VITE_RAZORPAY_KEY_ID`: Razorpay public key if payments are enabled

### Server environment

Set these values in `server/.env`:

- `MONGODB_URL`
- `JWT_SECRET`
- `OPENROUTER_API_KEY`
- `CLIENT_URL` or `CLIENT_URLS`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- `PORT` (optional; defaults to `6000`)

The server validates its required database, JWT, and Razorpay settings during startup.

## Run locally

Open two terminals.

Start the API server:

```bash
cd server
npm run dev
```

Start the Vite client:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

If the backend is not deployed or not configured, select **Continue as Guest** to explore the client. The guest profile is stored only in that browser. Backend-powered actions display an explanation instead of creating fake results.

## Useful commands

From `client/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

From `server/`:

```bash
npm run dev
```

## Authentication and data notes

- Google login uses Firebase to authenticate the user, then sends the user name and email to the Express API.
- The API creates or finds the MongoDB user and returns an HTTP-only JWT cookie.
- Guest login does not call the API and does not create a MongoDB record.
- Clearing the browser's site data removes the guest session and its local state.
- Never commit `.env` files or API keys. Only the example environment files should be committed.
