"""
In-process retrieval index, keyed by document id.

Uses TF-IDF + cosine similarity rather than dense embeddings, so there's
no extra API key or large model download needed to get real retrieval
working. It's a genuine (if simple) retrieval step, not a mock.

NOTE: this index lives in memory only — it's rebuilt from nothing on
server restart, so documents need to be re-uploaded after a restart.
When you're ready for production, swap this for persisted embeddings
(e.g. Voyage AI or OpenAI embeddings stored in Postgres/pgvector,
Chroma, or Pinecone) — the retrieve() function signature below is the
seam to keep the rest of the app unchanged.
"""

from dataclasses import dataclass

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@dataclass
class _DocumentIndex:
    chunks: list[str]
    vectorizer: TfidfVectorizer
    matrix: object  # sparse matrix from the fitted vectorizer


_INDEX: dict[str, _DocumentIndex] = {}


def index_document(doc_id: str, chunks: list[str]) -> None:
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(chunks)
    _INDEX[doc_id] = _DocumentIndex(chunks=chunks, vectorizer=vectorizer, matrix=matrix)


def remove_document(doc_id: str) -> None:
    _INDEX.pop(doc_id, None)


def retrieve(doc_id: str, question: str, top_k: int = 4) -> list[str]:
    entry = _INDEX.get(doc_id)
    if entry is None:
        return []

    question_vector = entry.vectorizer.transform([question])
    scores = cosine_similarity(question_vector, entry.matrix)[0]

    ranked = sorted(range(len(entry.chunks)), key=lambda i: scores[i], reverse=True)
    top_indices = [i for i in ranked[:top_k] if scores[i] > 0]

    return [entry.chunks[i] for i in top_indices]
