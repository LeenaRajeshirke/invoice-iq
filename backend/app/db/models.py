from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import JSON, Date, DateTime, Float, Numeric, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    invoice_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vendor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    invoice_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    subtotal: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    tax_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    discount_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    total_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    line_items: Mapped[list[dict[str, object]]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="uploaded", nullable=False)
    processing_status: Mapped[str] = mapped_column(
        String(30), default="placeholder", server_default="placeholder", nullable=False
    )
    review_status: Mapped[str] = mapped_column(
        String(30), default="pending", server_default="pending", nullable=False
    )
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    validation_warnings: Mapped[list[str]] = mapped_column(
        JSON, default=list, server_default=text("'[]'"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )