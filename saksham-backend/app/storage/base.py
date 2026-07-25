from abc import ABC, abstractmethod

from app.schemas import DocumentRecord


class StorageBackend(ABC):
    """
    Abstract storage interface for document metadata.

    Everything in the app talks to this interface, not to a specific
    database — swap JSONFileStorageBackend for a real Postgres/Mongo
    implementation later without touching routers or services.
    """

    @abstractmethod
    def save_document(self, doc: DocumentRecord) -> None: ...

    @abstractmethod
    def get_document(self, doc_id: str, user_id: str) -> DocumentRecord | None: ...

    @abstractmethod
    def list_documents(self, user_id: str) -> list[DocumentRecord]: ...

    @abstractmethod
    def delete_document(self, doc_id: str, user_id: str) -> None: ...
