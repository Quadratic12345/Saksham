from sqlalchemy import LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class DocumentModel(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    doc_type: Mapped[str] = mapped_column(String, nullable=False, server_default="text")
    error_message: Mapped[str | None] = mapped_column(String, nullable=True)
    file_bytes: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
