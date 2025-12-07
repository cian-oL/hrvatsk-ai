"""
LLM client using LiteLLM for provider-agnostic completions.
"""

from litellm import completion as litellm_completion

from hrvatsk_ai_api.config import settings


def completion(
    messages: list[dict],
    response_format: dict | None = None,
    temperature: float = 0.7,
) -> str:
    """
    Call LLM and return the response content.

    Args:
        messages: List of message dicts with 'role' and 'content'
        response_format: Optional format spec (e.g., {"type": "json_object"})
        temperature: Sampling temperature

    Returns:
        The assistant's response content as a string
    """
    kwargs = {
        "model": settings.llm_model,
        "messages": messages,
        "temperature": temperature,
        "api_key": settings.groq_api_key,
    }

    if response_format:
        kwargs["response_format"] = response_format

    response = litellm_completion(**kwargs)
    return response.choices[0].message.content
