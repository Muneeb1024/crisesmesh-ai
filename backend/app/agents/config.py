"""
CrisesMesh AI — Agent Configuration
Stores Gemini API keys and ADK runtime settings.
"""

import os
from pydantic_settings import BaseSettings

class AgentSettings(BaseSettings):
    # Gemini API Key (set in backend/.env)
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "mock_key")
    
    # Model configuration
    default_model: str = "gemini-flash-latest"
    
    # Trace configuration
    store_traces_in_db: bool = False
    max_trace_history: int = 50

    class Config:
        env_file = ".env"
        extra = "ignore"

agent_settings = AgentSettings()

