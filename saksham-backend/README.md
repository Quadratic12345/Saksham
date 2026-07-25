# Saksham API

FastAPI backend for Saksham: upload a PDF, ask questions about it, get
answers grounded in what's actually in the document.

## How it works
1. **Upload** (`POST /api/documents`) — extracts text from the PDF (`pypdf`),
   splits it into overlapping chunks, and builds a TF-IDF index over those
   chunks in memory.
2. **Ask** (`POST /api/chat`) — your question is matched against the
   document's chunks via cosine similarity (scikit-learn), and the
   best-matching excerpts are sent to Claude along with your question.
   Claude is instructed to answer only from those excerpts.
3. **Auth** — every request must include a Clerk session token
   (`Authorization: Bearer <token>`), verified against Clerk's public keys.
   No Clerk secret key needed on this backend — just the issuer URL.

This is intentionally simple for a first backend:
- **Retrieval is TF-IDF, not dense embeddings.** No extra API key, no large
  model download, and it's a genuine retrieval step (not mocked) — just
  less semantically flexible than embeddings. Upgrade path: swap
  `services/vector_index.py` for real embeddings (Voyage AI, OpenAI, or a
  local sentence-transformers model). Postgres + the `pgvector` extension
  is a natural place to store those embeddings later — same database,
  no separate vector store needed.
- **The retrieval index is in-memory only.** Document *metadata*
  (filename, status, ownership) is persisted in Postgres and survives
  restarts, but the actual chunk text/TF-IDF vectors used for retrieval
  don't yet — documents need to be re-uploaded after a server restart
  to be queryable again. This is the next thing worth persisting once
  you move to real embeddings.
- **PDF processing is synchronous.** Fine for note-length PDFs; for large
  files, move this into a background task/queue instead.

## Setup

### 1. Postgres

You need a running Postgres instance. Locally, the easiest way is Docker:

```bash
docker run --name saksham-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Then create the database:
```bash
docker exec -it saksham-db psql -U postgres -c "CREATE DATABASE saksham;"
```

(No Docker? Install Postgres directly — e.g. `brew install postgresql` on
macOS, `apt install postgresql` on Ubuntu — then create the `saksham`
database the same way with `psql`.)

Tables are created automatically on first run — no migration step needed
for now.

### 2. Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `.env`:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `CLERK_ISSUER` — from the Clerk dashboard (Configure → API Keys →
  "Frontend API URL"), same Clerk app as your frontend's publishable key
- `DATABASE_URL` — e.g. `postgresql://postgres:postgres@localhost:5432/saksham`
  (matches the Docker command above by default)

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs at http://localhost:8000/docs.

## Frontend integration

The Saksham frontend is already wired up to this API (`src/lib/api.ts`,
used from `Dashboard.tsx`). It attaches the Clerk session token
(`Authorization: Bearer <token>`) to every request — make sure the
frontend's `VITE_CLERK_PUBLISHABLE_KEY` and this backend's `CLERK_ISSUER`
point at the **same Clerk application**, or token verification will fail.

Set the frontend's `VITE_API_BASE_URL` to wherever this backend is
running (`http://localhost:8000` in development).

## Endpoints

| Method | Path                     | Description                          |
|--------|--------------------------|---------------------------------------|
| POST   | `/api/documents`         | Upload a PDF, parse it, index it      |
| GET    | `/api/documents`         | List the signed-in user's documents   |
| DELETE | `/api/documents/{id}`    | Delete a document                     |
| POST   | `/api/chat`              | Ask a question about a document       |
| GET    | `/health`                | Health check                          |

All routes except `/health` require a valid Clerk `Authorization` header.
