# MindForge AI - AI Learning Assistant

MindForge AI transforms static PDFs into dynamic, interactive learning experiences.

## Features

- JWT authentication (register/login)
- PDF/text upload with parsing and user ownership
- AI chat grounded in uploaded document context
- Document summarization (full or focused sections)
- AI-generated flashcards with flip-card UI
- AI-generated quizzes with auto-evaluation and feedback
- Analytics dashboard with learning activity charts

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Context API
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Multer
- pdf-parse
- JWT
- Google Gemini API

## Project Structure

mindforge-ai/
- backend/
  - controllers/
  - middleware/
  - models/
  - routes/
  - utils/
  - server.js
- frontend/
  - src/
    - components/
    - context/
    - layouts/
    - pages/
    - services/
    - App.jsx
    - main.jsx

## Setup Instructions

### 1) Clone and install dependencies

```bash
cd mindforge-ai
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment variables

Backend:

```bash
cd backend
cp .env.example .env
```

Frontend:

```bash
cd ../frontend
cp .env.example .env
```

Update values in backend `.env`:

- `MONGO_URI` - your MongoDB connection string
- `JWT_SECRET` - a long random secret
- `GEMINI_API_KEY` - your Google Gemini API key
- `GEMINI_MODEL` - optional (default `gemini-2.0-flash`)
- `CLIENT_URL` - frontend URL (default `http://localhost:5173`)

### 3) Run backend

```bash
cd backend
npm run dev
```

Backend runs on `import.meta.env.VITE_API_URL`.

### 4) Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Documents
- `POST /api/documents`
- `GET /api/documents`

### AI
- `POST /api/ai/chat`
- `GET /api/ai/chat-history/:id`
- `POST /api/ai/flashcards`
- `POST /api/ai/quiz`
- `POST /api/ai/summary`

### Analytics
- `GET /api/analytics/overview`

## Notes

- Upload limits: 10MB per file.
- Supported file types: PDF, TXT, and Markdown text files.
- Chat answers are grounded in document chunks via context retrieval.
- Quiz endpoint supports both generation and evaluation via `action` in payload:
  - `action: "generate"`
  - `action: "evaluate"`
