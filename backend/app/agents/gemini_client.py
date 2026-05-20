"""
CrisesMesh AI — Gemini API Client
Asynchronous helper for querying Google Gemini 1.5 Flash/Pro with JSON parsing and fallback.
"""

import httpx
import json
import logging
from typing import Any, Dict, Optional
from app.agents.config import agent_settings

logger = logging.getLogger("crisesmesh.gemini")

async def query_gemini_json(
    prompt: str,
    model: Optional[str] = None,
    fallback_result: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Queries Google Gemini REST API, requesting a structured JSON response.
    Returns: Parsed JSON dict, or fallback_result if anything fails.
    """
    selected_model = model or agent_settings.default_model
    if selected_model in ("gemini-1.5-flash", "gemini-2.0-flash"):
        selected_model = "gemini-flash-latest"
    elif selected_model in ("gemini-1.5-pro", "gemini-2.5-pro"):
        selected_model = "gemini-pro-latest"
    api_key = agent_settings.gemini_api_key
    if not api_key or api_key == "mock_key":
        logger.warning("Gemini API key is not configured. Falling back to offline sandbox.")
        return fallback_result if fallback_result is not None else {}

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{selected_model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        
        # Structure the payload with JSON generation config
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
            else:
                logger.error(f"Gemini API error ({response.status_code}): {response.text}")
    except Exception as e:
        logger.error(f"Gemini socket/timeout exception: {str(e)}")

    return fallback_result if fallback_result is not None else {}
