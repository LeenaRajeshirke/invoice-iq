import logging
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.db.models import Invoice
from app.services.extraction_service import ExtractionResult, extract_invoice_data
from app.services.export_service import export_invoices
from app.services.ocr_service import extract_text
from app.schemas.invoice import (
	InvoiceRead,
	InvoiceReviewRequest,
	InvoiceUpdate,
	InvoiceUploadResponse,
)


router = APIRouter(tags=["invoices"])
logger = logging.getLogger(__name__)

UPLOADS_DIR = settings.upload_dir
MAX_UPLOAD_SIZE_BYTES = settings.max_upload_size_bytes
EXTRACTION_WARNING = (
	"OCR text recognition and baseline invoice-field extraction completed; "
	"some fields need manual review."
)
NO_TEXT_WARNING = (
	"OCR completed but no readable text was recognized; invoice fields need manual review."
)
OCR_FAILURE_WARNING = "OCR text recognition failed; this invoice requires manual review."
EXTRACTION_FAILURE_WARNING = "Invoice field extraction failed; recognized text was saved for manual review."
SUPPORTED_FILES = {
	".pdf": ("application/pdf", b"%PDF-"),
	".png": ("image/png", b"\x89PNG\r\n\x1a\n"),
	".jpg": ("image/jpeg", b"\xff\xd8\xff"),
	".jpeg": ("image/jpeg", b"\xff\xd8\xff"),
}


def _apply_extraction(invoice: Invoice, result: ExtractionResult) -> None:
	if invoice.review_status == "reviewed":
		return

	fields = result.fields.model_dump(exclude_none=True)
	line_items = fields.pop("line_items", [])
	for field, value in fields.items():
		if getattr(invoice, field) is None:
			setattr(invoice, field, value)
	if not invoice.line_items and line_items:
		invoice.line_items = [item.model_dump(mode="json") for item in result.fields.line_items]

	invoice.validation_warnings = list(
		dict.fromkeys([*invoice.validation_warnings, *result.validation_warnings])
	)
	if result.validation_warnings:
		invoice.review_status = "needs_review"


async def _read_upload(file: UploadFile, extension: str) -> bytes:
	content_type, signature = SUPPORTED_FILES[extension]
	if file.content_type not in (None, content_type, "application/octet-stream", "image/jpg"):
		raise HTTPException(
			status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
			detail="File content type does not match a supported invoice format.",
		)

	chunks: list[bytes] = []
	size = 0
	while chunk := await file.read(64 * 1024):
		size += len(chunk)
		if size > MAX_UPLOAD_SIZE_BYTES:
			raise HTTPException(
				status_code=status.HTTP_413_CONTENT_TOO_LARGE,
				detail=f"File exceeds the {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB upload limit.",
			)
		chunks.append(chunk)

	content = b"".join(chunks)
	if not content:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
	if not content.startswith(signature):
		raise HTTPException(
			status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
			detail="File contents do not match the declared PDF or image format.",
		)
	return content


@router.get("/invoices", response_model=list[InvoiceRead])
def list_invoices(database: Session = Depends(get_db)) -> list[Invoice]:
	return list(
		database.scalars(
			select(Invoice).order_by(Invoice.created_at.desc(), Invoice.id.desc())
		).all()
	)


def _invoice_export_records(database: Session) -> list[InvoiceRead]:
	records = database.scalars(
		select(Invoice).order_by(Invoice.created_at.desc(), Invoice.id.desc())
	).all()
	return [InvoiceRead.model_validate(record) for record in records]


@router.get("/invoices/export/json", response_class=Response)
def export_invoices_json(database: Session = Depends(get_db)) -> Response:
	return Response(
		content=export_invoices(_invoice_export_records(database), "json"),
		media_type="application/json",
		headers={"Content-Disposition": 'attachment; filename="invoices.json"'},
	)


@router.get("/invoices/export/csv", response_class=Response)
def export_invoices_csv(database: Session = Depends(get_db)) -> Response:
	return Response(
		content=export_invoices(_invoice_export_records(database), "csv"),
		media_type="text/csv",
		headers={"Content-Disposition": 'attachment; filename="invoices.csv"'},
	)


@router.get("/invoices/{invoice_id}", response_model=InvoiceRead)
def get_invoice(invoice_id: int, database: Session = Depends(get_db)) -> Invoice:
	invoice = database.get(Invoice, invoice_id)
	if invoice is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
	return invoice


@router.post(
	"/invoices/upload",
	response_model=InvoiceUploadResponse,
	status_code=status.HTTP_201_CREATED,
)
async def upload_invoice(
	file: UploadFile = File(...),
	database: Session = Depends(get_db),
) -> InvoiceUploadResponse:
	original_filename = (file.filename or "upload").replace("\\", "/").rsplit("/", 1)[-1]
	extension = Path(original_filename).suffix.lower()
	if extension not in SUPPORTED_FILES:
		raise HTTPException(
			status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
			detail="Only PDF, PNG, JPG, and JPEG files are supported.",
		)

	content = await _read_upload(file, extension)
	safe_filename = f"{uuid4().hex}{extension}"
	UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
	stored_path = UPLOADS_DIR / safe_filename
	stored_path.write_bytes(content)
	ocr_failed = False
	try:
		extracted_text = await run_in_threadpool(extract_text, stored_path)
	except Exception:
		logger.exception("OCR text recognition failed for uploaded invoice %s", original_filename)
		extracted_text = None
		ocr_failed = True

	extraction_result = None
	extraction_failed = False
	if not ocr_failed:
		try:
			extraction_result = await run_in_threadpool(extract_invoice_data, extracted_text or "")
		except Exception:
			logger.exception("Invoice field extraction failed for uploaded invoice %s", original_filename)
			extraction_failed = True

	processing_status = "failed" if ocr_failed or extraction_failed else "processed"
	if ocr_failed:
		warning = OCR_FAILURE_WARNING
	elif extraction_failed:
		warning = EXTRACTION_FAILURE_WARNING
	elif not (extracted_text or "").strip():
		warning = NO_TEXT_WARNING
	elif extraction_result and extraction_result.validation_warnings:
		warning = EXTRACTION_WARNING
	else:
		warning = "OCR text recognition and baseline invoice-field extraction completed."

	invoice = Invoice(
		original_filename=original_filename[:255],
		stored_filename=safe_filename,
		extracted_text=extracted_text,
		processing_status=processing_status,
		review_status="pending",
		confidence=None,
		line_items=[],
		validation_warnings=[warning] if ocr_failed or extraction_failed else [],
	)
	if extraction_result:
		_apply_extraction(invoice, extraction_result)
	elif ocr_failed or extraction_failed or not (extracted_text or "").strip():
		invoice.validation_warnings = [warning]
		invoice.review_status = "needs_review"
	try:
		database.add(invoice)
		database.commit()
		database.refresh(invoice)
	except SQLAlchemyError as error:
		database.rollback()
		stored_path.unlink(missing_ok=True)
		logger.exception("Failed to persist uploaded invoice %s", original_filename)
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Could not save the uploaded invoice.",
		) from error

	return InvoiceUploadResponse(
		invoice_id=invoice.id,
		processing_status=processing_status,
		message=warning,
	)


@router.patch("/invoices/{invoice_id}", response_model=InvoiceRead)
def update_invoice(
	invoice_id: int,
	updates: InvoiceUpdate,
	database: Session = Depends(get_db),
) -> Invoice:
	invoice = database.get(Invoice, invoice_id)
	if invoice is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

	update_data = updates.model_dump(exclude_unset=True)
	if "line_items" in update_data:
		update_data["line_items"] = [item.model_dump(mode="json") for item in updates.line_items]

	for field, value in update_data.items():
		setattr(invoice, field, value)
	database.commit()
	database.refresh(invoice)
	return invoice


@router.post("/invoices/{invoice_id}/review", response_model=InvoiceRead)
def review_invoice(
	invoice_id: int,
	review: InvoiceReviewRequest,
	database: Session = Depends(get_db),
) -> Invoice:
	invoice = database.get(Invoice, invoice_id)
	if invoice is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

	invoice.review_status = review.status
	database.commit()
	database.refresh(invoice)
	return invoice