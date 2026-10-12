import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    database_url: str
    cors_origins: tuple[str, ...]
    upload_dir: Path
    max_upload_size_bytes: int


def load_settings() -> Settings:
    origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://localhost:5000,http://127.0.0.1:5000",
    )
    return Settings(
        database_url=os.getenv("DATABASE_URL", "sqlite:///./invoiceiq.db"),
        cors_origins=tuple(origin.strip() for origin in origins.split(",") if origin.strip()),
        upload_dir=Path(os.getenv("UPLOAD_DIR", "uploads")),
        max_upload_size_bytes=int(os.getenv("MAX_UPLOAD_SIZE_MB", "10")) * 1024 * 1024,
    )


settings = load_settings()