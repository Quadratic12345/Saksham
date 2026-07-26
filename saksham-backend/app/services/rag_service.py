from groq import Groq

from app.config import get_settings

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=get_settings().groq_api_key)
    return _client


def answer_question(question: str, context_chunks: list[str]) -> str:
    """Sends the retrieved chunks + question to Groq (Llama) and returns the answer."""
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
    response = _get_client().chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        max_tokens=600,
    )

    return (response.choices[0].message.content or "").strip()
