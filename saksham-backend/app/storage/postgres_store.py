from sqlalchemy.orm import Session

from app.models_db import DocumentModel
from app.schemas import DocumentRecord
from app.storage.base import StorageBackend


class PostgresStorageBackend(StorageBackend):
    """
    Postgres-backed implementation of StorageBackend, using a SQLAlchemy
    session provided per-request (see routers, which get this via the
    get_db / get_storage dependencies). Same interface as the old
    JSONFileStorageBackend — nothing outside app/storage/ needed to change.
    """

    def __init__(self, db: Session):
        self._db = db

    def save_document(self, doc: DocumentRecord) -> None:
        existing = self._db.get(DocumentModel, doc.id)
        if existing is None:
            self._db.add(
                DocumentModel(
                    id=doc.id,
                    user_id=doc.user_id,
                    filename=doc.filename,
                    status=doc.status,
                    doc_type=doc.doc_type,
                    error_message=doc.error_message,
                )
            )
        else:
            existing.filename = doc.filename
            existing.status = doc.status
            existing.doc_type = doc.doc_type
            existing.error_message = doc.error_message
        self._db.commit()

    def get_document(self, doc_id: str, user_id: str) -> DocumentRecord | None:
        row = self._db.get(DocumentModel, doc_id)
        if row is None or row.user_id != user_id:
            return None
        return _to_record(row)

    def list_documents(self, user_id: str) -> list[DocumentRecord]:
        rows = (
            self._db.query(DocumentModel)
            .filter(DocumentModel.user_id == user_id)
            .all()
        )
        return [_to_record(row) for row in rows]

    def delete_document(self, doc_id: str, user_id: str) -> None:
        row = self._db.get(DocumentModel, doc_id)
        if row is not None and row.user_id == user_id:
            self._db.delete(row)
            self._db.commit()

    def save_file(self, doc_id: str, file_bytes: bytes) -> None:
        row = self._db.get(DocumentModel, doc_id)
        if row is not None:
            row.file_bytes = file_bytes
            self._db.commit()

    def get_file(self, doc_id: str, user_id: str) -> bytes | None:
        row = self._db.get(DocumentModel, doc_id)
        if row is None or row.user_id != user_id:
            return None
        return row.file_bytes


def _to_record(row: DocumentModel) -> DocumentRecord:
    return DocumentRecord(
        id=row.id,
        user_id=row.user_id,
        filename=row.filename,
        status=row.status,  # type: ignore[arg-type]
        doc_type=row.doc_type,  # type: ignore[arg-type]
        error_message=row.error_message,
    )
