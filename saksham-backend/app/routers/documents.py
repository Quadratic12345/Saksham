import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.db import get_db
from app.schemas import DocumentOut, DocumentRecord
from app.services import vector_index
from app.services.chunking import chunk_text
from app.services.pdf_service import extract_text_from_pdf, pdf_to_base64_images
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
    # Persisted so the PDF can be viewed later, even after a server
    # restart — separate from the retrieval index, which stays in memory.
    storage.save_file(doc_id, file_bytes)

    try:
        text = extract_text_from_pdf(file_bytes)
        chunks = chunk_text(text)

        if chunks:
            vector_index.index_document(doc_id, chunks)
            doc.doc_type = "text"
        else:
            images = pdf_to_base64_images(file_bytes)
            if not images:
                raise ValueError("Couldn't read any pages from this PDF.")
            vector_index.store_images(doc_id, images)
            doc.doc_type = "image"

        doc.status = "ready"
    except Exception as exc:  # noqa: BLE001
        doc.status = "error"
        doc.error_message = str(exc)

    storage.save_document(doc)

    return DocumentOut(
        id=doc.id,
        filename=doc.filename,
        status=doc.status,
        doc_type=doc.doc_type,
        error_message=doc.error_message,
    )


@router.get("", response_model=list[DocumentOut])
def list_documents(
    user_id: str = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
):
    docs = storage.list_documents(user_id)
    return [
        DocumentOut(
            id=d.id,
            filename=d.filename,
            status=d.status,
            doc_type=d.doc_type,
            error_message=d.error_message,
        )
        for d in docs
    ]


@router.get("/{document_id}/file")
def get_document_file(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
):
    doc = storage.get_document(document_id, user_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    file_bytes = storage.get_file(document_id, user_id)
    if file_bytes is None:
        raise HTTPException(status_code=404, detail="No file stored for this document.")

    return Response(
        content=file_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{doc.filename}"'},
    )


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    storage: StorageBackend = Depends(get_storage),
):
    storage.delete_document(document_id, user_id)
    vector_index.remove_document(document_id)
