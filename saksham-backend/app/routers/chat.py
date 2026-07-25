from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user_id
from app.config import Settings, get_settings
from app.routers.documents import get_storage
from app.schemas import ChatRequest, ChatResponse
from app.services import vector_index
from app.services.rag_service import answer_question
from app.storage.base import StorageBackend

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
):
    doc = storage.get_document(request.document_id, user_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.status != "ready":
        raise HTTPException(
            status_code=409,
            detail=f"Document is not ready yet (status: {doc.status}).",
        )

    context_chunks = vector_index.retrieve(request.document_id, request.question)
    answer = answer_question(request.question, context_chunks)

    return ChatResponse(answer=answer)
