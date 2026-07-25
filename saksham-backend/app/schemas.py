from typing import Literal

from pydantic import BaseModel

DocumentStatus = Literal["parsing", "ready", "error"]


class DocumentRecord(BaseModel):
    """Persisted metadata for one uploaded document (no chunk text/vectors —
    those live in the in-memory vector index; see services/vector_index.py)."""

    id: str
    user_id: str
    filename: str
    status: DocumentStatus
    error_message: str | None = None


class DocumentOut(BaseModel):
    id: str
    filename: str
    status: DocumentStatus


class ChatRequest(BaseModel):
    document_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str
