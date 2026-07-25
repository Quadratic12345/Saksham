import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.db import get_db
from app.schemas import DocumentOut, DocumentRecord
from app.services import vector_index
from app.services.chunking import chunk_text
from app.services.pdf_service import extract_text_from_pdf
from app.storage.base import StorageBackend
from app.storage.postgres_store import PostgresStorageBackend

router = APIRouter(prefix="/api/documents", tags=["documents"])


def get_storage(db: Session = Depends(get_db)) -> StorageBackend:
    return PostgresStorageBackend(db)


@router.post("", response_model=DocumentOut)
async def upload_document(
    file: UploadFile,
    user_id: str = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    doc_id = str(uuid.uuid4())
    file_bytes = await file.read()

    doc = DocumentRecord(
        id=doc_id,
        user_id=user_id,
        filename=file.filename or "document.pdf",
        status="parsing",
    )
    storage.save_document(doc)

    # Processed synchronously for simplicity — fine for note-length PDFs.
    # For large files, move this to a background task/queue instead so
    # the request returns immediately.
    try:
        text = extract_text_from_pdf(file_bytes)
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("No extractable text found in this PDF.")

        vector_index.index_document(doc_id, chunks)
        doc.status = "ready"
    except Exception as exc:  # noqa: BLE001 — surface any parsing failure to the user
        doc.status = "error"
        doc.error_message = str(exc)

    storage.save_document(doc)

    return DocumentOut(id=doc.id, filename=doc.filename, status=doc.status)


@router.get("", response_model=list[DocumentOut])
def list_documents(
    user_id: str = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
):
    docs = storage.list_documents(user_id)
    return [DocumentOut(id=d.id, filename=d.filename, status=d.status) for d in docs]


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
):
    storage.delete_document(document_id, user_id)
    vector_index.remove_document(document_id)
