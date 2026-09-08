import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings for Layer 3 Graph & Reasoning Service."""
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # Neo4j AuraDB Connection Parameters
    NEO4J_URI: str = "neo4j+s://your-instance-id.databases.neo4j.io"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "your-auradb-password"
    NEO4J_DATABASE: str = "neo4j"
    NEO4J_CONNECTION_TIMEOUT: float = 10.0

    # Mock Graph mode for offline dev and unit tests without live AuraDB credentials
    # Options: "auto" (default: mocks if credentials are placeholder), "true", "false"
    USE_MOCK_GRAPH: str = "auto"

    def is_live_aura_configured(self) -> bool:
        """Check whether valid, non-placeholder Neo4j credentials are provided."""
        if self.USE_MOCK_GRAPH.lower() == "true":
            return False
        if not self.NEO4J_URI or not self.NEO4J_PASSWORD:
            return False
        if "your-instance-id" in self.NEO4J_URI or "your-auradb-password" in self.NEO4J_PASSWORD:
            return False
        return True


settings = Settings()
