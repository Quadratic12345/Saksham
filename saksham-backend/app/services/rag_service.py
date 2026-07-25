from anthropic import Anthropic

from app.config import get_settings

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=get_settings().anthropic_api_key)
    return _client


def answer_question(question: str, context_chunks: list[str]) -> str:
    """Sends the retrieved chunks + question to Claude and returns the answer."""
    if not context_chunks:
        return (
            "I couldn't find anything in this document that relates to your "
            "question. Try rephrasing it, or check the document actually "
            "covers this topic."
        )

    context = "\n\n---\n\n".join(context_chunks)

    system_prompt = (
        "You are a study assistant answering questions about a specific "
        "document the user uploaded. Answer using ONLY the excerpts "
        "provided below. If the excerpts don't contain the answer, say so "
        "plainly rather than guessing."
    )

    user_message = f"Document excerpts:\n\n{context}\n\nQuestion: {question}"

    settings = get_settings()
    response = _get_client().messages.create(
        model=settings.claude_model,
        max_tokens=600,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    text_blocks = [block.text for block in response.content if block.type == "text"]
    return "\n".join(text_blocks).strip()
