# Saksham

Upload your notes as a PDF typed or handwritten and ask questions
about them. Saksham reads what's actually in the document and answers
from that, not from general knowledge.

**🔗 Live demo: [sakshamnotes.vercel.app](https://sakshamnotes.vercel.app)**

## What it does

- **Sign up / log in** handled by Clerk, no backend of your own needed for auth
- **Upload a PDF** drag-and-drop or browse
  - Typed/digital PDFs get parsed and indexed for fast, targeted retrieval
  - Handwritten or scanned PDFs are read directly by a vision-capable model —
    no separate OCR step, no loss of accuracy from a text-extraction middleman
- **Ask questions** get answers grounded in the actual document, with a
  clear "I couldn't find that" instead of a made-up answer when it's not
  in there
- **Profile page** see your account details and every note you've
  uploaded, with its status and type at a glance
- **Light/dark mode** a toggle that actually persists across visits

## How it's built

This is a monorepo  two independent apps that talk to each other over
an API, not a single combined codebase.

### Frontend
- **Vite + React + TypeScript**
- **Clerk** for authentication (sign up, log in, session management)
- **react-router-dom**  `/` (landing), `/dashboard`, `/profile`
- **Tailwind CSS** used specifically to keep Clerk's UI in sync with the
  rest of the app's theme, on top of the app's own CSS-variable-based
  design system
- Deployed on **Vercel**

### Backend
- **FastAPI** (Python)
- **Postgres** for document metadata (deployed via **Neon**, works with
  any Postgres host)
- **OpenRouter**, using `nvidia/nemotron-nano-12b-v2-vl:free` — one free
  model that handles both normal text Q&A *and* reads handwritten/scanned
  pages directly, no separate vision provider needed
- **TF-IDF + cosine similarity** for retrieval on typed documents — a
  real, working retrieval step without needing a paid embeddings API
- Deployed on **Render**, via Docker (needed for `poppler`, a system-level
  tool used to convert PDF pages to images for the handwriting path)

Full setup instructions for running the backend locally are in
[`saksham-backend/README.md`](./saksham-backend/README.md).

## Running the frontend locally

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
```bash
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Deployment notes

Frontend (Vercel) and backend (Render) are deployed independently. For
either to work correctly together:
- Backend's `CORS_ORIGINS` must include the frontend's actual deployed URL
- Frontend's `VITE_API_BASE_URL` must point at the backend's actual
  deployed URL
- Both must reference the **same Clerk application**

## Project status

Actively being built. Current known limitations:
- Retrieval index and page images for handwritten docs are in-memory on
  the backend — they don't survive a server restart (document metadata
  does, via Postgres, but you'd need to re-upload the file itself)
- No background job queue yet — uploads are processed synchronously,
  fine for note-length PDFs but not built for very large documents
