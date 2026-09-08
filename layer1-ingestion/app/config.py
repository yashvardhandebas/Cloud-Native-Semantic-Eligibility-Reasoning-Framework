import os
import shutil
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import pytesseract


def _find_tesseract_executable() -> Optional[str]:
    """Auto-detect Tesseract executable across standard OS locations."""
    # 1. Check if 'tesseract' is on system PATH
    which_path = shutil.which("tesseract")
    if which_path and Path(which_path).is_file():
        return which_path

    # 2. Check Windows user local installation
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    if local_app_data:
        candidate = Path(local_app_data) / "Programs" / "Tesseract-OCR" / "tesseract.exe"
        if candidate.is_file():
            return str(candidate)

    # 3. Check Windows Program Files
    candidates = [
        Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe"),
        Path(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"),
        # Common Linux / Docker paths
        Path("/usr/bin/tesseract"),
        Path("/usr/local/bin/tesseract"),
    ]
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)

    return None


class Settings(BaseSettings):
    """Configuration settings for Layer 1 Ingestion service."""
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # OCR settings
    TESSERACT_CMD: Optional[str] = None
    TESSDATA_PREFIX: Optional[str] = None
    DEFAULT_OCR_LANGUAGES: str = "eng"
    OCR_DPI: int = 300
    
    # Service settings
    MAX_UPLOAD_SIZE_MB: int = 25
    REQUEST_TIMEOUT_SECONDS: int = 30

    def init_tesseract(self) -> Optional[str]:
        """Configure pytesseract with resolved binary and tessdata paths."""
        resolved_cmd = self.TESSERACT_CMD or _find_tesseract_executable()
        if resolved_cmd:
            pytesseract.pytesseract.tesseract_cmd = resolved_cmd
            self.TESSERACT_CMD = resolved_cmd

        if self.TESSDATA_PREFIX and Path(self.TESSDATA_PREFIX).exists():
            os.environ["TESSDATA_PREFIX"] = self.TESSDATA_PREFIX

        return resolved_cmd


settings = Settings()
settings.init_tesseract()
