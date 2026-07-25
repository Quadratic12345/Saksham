import io

from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts all text from a PDF's pages, joined with page breaks."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(pages).strip()
