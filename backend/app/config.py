"""
CrisesMesh AI — Backend Settings
Loads from .env and provides typed config access.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    app_name: str = "CrisesMesh AI Backend"
    app_version: str = "0.1.0"
    debug: bool = True

    # CORS
    cors_origins: str = "*"

    # Gemini / Google ADK (Day 3)
    gemini_api_key: str = ""
    google_cloud_project: str = ""

    # Supabase (Task 2.2)
    supabase_url: str = ""
    supabase_key: str = ""

    # Weather
    weather_api_url: str = "https://api.open-meteo.com/v1/forecast"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
