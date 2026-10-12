from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    from app.db import models

    Base.metadata.create_all(bind=engine)
    _migrate_existing_invoice_table()


def _migrate_existing_invoice_table() -> None:
    if engine.dialect.name != "sqlite":
        return

    existing_columns = {column["name"] for column in inspect(engine).get_columns("invoices")}
    additions = {
        "stored_filename": "VARCHAR(255)",
        "extracted_text": "TEXT",
        "due_date": "DATE",
        "currency": "VARCHAR(3)",
        "subtotal": "NUMERIC(12, 2)",
        "tax_amount": "NUMERIC(12, 2)",
        "discount_amount": "NUMERIC(12, 2)",
        "line_items": "JSON NOT NULL DEFAULT '[]'",
        "processing_status": "VARCHAR(30) NOT NULL DEFAULT 'placeholder'",
        "review_status": "VARCHAR(30) NOT NULL DEFAULT 'pending'",
        "confidence": "FLOAT",
        "validation_warnings": "JSON NOT NULL DEFAULT '[]'",
        "updated_at": "DATETIME",
    }

    with engine.begin() as connection:
        for column_name, declaration in additions.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(f"ALTER TABLE invoices ADD COLUMN {column_name} {declaration}")
                )
        connection.execute(
            text("UPDATE invoices SET updated_at = created_at WHERE updated_at IS NULL")
        )


def get_db() -> Generator[Session, None, None]:
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()