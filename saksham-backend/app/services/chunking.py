def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
    """
    Splits text into overlapping chunks by character count. Simple and
    dependency-free — good enough for note-taking-length PDFs. If you
    later work with much larger documents, consider chunking by sentence
    or paragraph boundaries instead of a raw character window.
    """
    text = text.strip()
    if not text:
        return []

    chunks: list[str] = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == text_length:
            break
        start = end - overlap

    return chunks
