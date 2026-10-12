from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class InvoiceLineItem(BaseModel):
    description: str | None = None
    quantity: Decimal | None = None
    unit_price: Decimal | None = None
    tax_amount: Decimal | None = None
    total_amount: Decimal | None = None


class InvoiceFields(BaseModel):
    invoice_number: str | None = None
    vendor_name: str | None = None
    invoice_date: date | None = None
    due_date: date | None = None
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    subtotal: Decimal | None = None
    tax_amount: Decimal | None = None
    discount_amount: Decimal | None = None
    total_amount: Decimal | None = None
    line_items: list[InvoiceLineItem] = Field(default_factory=list)


class InvoiceCreate(InvoiceFields):
    original_filename: str


class InvoiceUpdate(InvoiceFields):
    pass


class InvoiceRead(InvoiceFields):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    extracted_text: str | None = None
    processing_status: Literal["pending", "placeholder", "processed", "failed"]
    review_status: Literal["pending", "reviewed", "needs_review", "rejected"]
    confidence: float | None
    validation_warnings: list[str]
    created_at: datetime
    updated_at: datetime


class InvoiceUploadResponse(BaseModel):
    invoice_id: int
    processing_status: Literal["placeholder", "processed", "failed"]
    message: str


class InvoiceReviewRequest(BaseModel):
    status: Literal["pending", "reviewed", "needs_review", "rejected"]