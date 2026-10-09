"""
FastAPI service for Layer 1 - Document Ingestion & OCR.
"""

from typing import Optional
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from pydantic import BaseModel

from app.ocr import ocr_engine
from app.cleaner import clean_ocr_text
from app.schema import IngestedNotification, OCRResult, SourceType, DetectedLanguage

app = FastAPI(
    title="Layer 1 Ingestion Service",
    description="Extracts raw & cleaned text from document images/PDFs using Tesseract OCR.",
    version="1.0.0",
)


class TextExtractionRequest(BaseModel):
    raw_text: str
    source_name: str = "direct_text"
    language: str = "en"


@app.get("/health")
def health_check():
    return {"status": "ok", "layer": 1, "service": "ingestion"}


@app.post("/api/v1/ocr/extract", response_model=IngestedNotification)
async def extract_document(
    file: Optional[UploadFile] = File(None),
    language: str = Form("en"),
):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided for OCR extraction.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file content.")

    filename = file.filename or "uploaded_document"
    ext = filename.split(".")[-1].lower() if "." in filename else "png"
    mime_or_ext = file.content_type or ext

    try:
        ocr_result: OCRResult = ocr_engine.extract(content, mime_or_ext, languages=language)
        cleaned = clean_ocr_text(ocr_result.raw_text)

        notif_id = IngestedNotification.generate_notification_id(content)
        src_type = SourceType.PDF if "pdf" in mime_or_ext else SourceType.SCANNED_IMAGE
        lang_enum = DetectedLanguage.EN if language.lower().startswith("en") else DetectedLanguage(language) if language in ["hi", "ta", "te"] else DetectedLanguage.UNKNOWN

        metadata = IngestedNotification.create_metadata(
            source_name=filename,
            source_type=src_type,
            page_count=ocr_result.page_count,
            file_size_bytes=len(content),
        )

        return IngestedNotification(
            notification_id=notif_id,
            source_type=src_type,
            detected_language=lang_enum,
            language_confidence=0.9,
            raw_ocr_text=ocr_result.raw_text,
            cleaned_text=cleaned,
            source_metadata=metadata,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {str(e)}")


@app.post("/api/v1/ocr/process-text", response_model=IngestedNotification)
def process_direct_text(req: TextExtractionRequest):
    if not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty.")

    cleaned = clean_ocr_text(req.raw_text)
    notif_id = IngestedNotification.generate_notification_id(req.raw_text)
    lang_enum = DetectedLanguage(req.language) if req.language in ["en", "hi", "ta", "te"] else DetectedLanguage.UNKNOWN

    metadata = IngestedNotification.create_metadata(
        source_name=req.source_name,
        source_type=SourceType.WEB_PAGE,
        page_count=1,
        file_size_bytes=len(req.raw_text.encode("utf-8")),
    )

    return IngestedNotification(
        notification_id=notif_id,
        source_type=SourceType.WEB_PAGE,
        detected_language=lang_enum,
        language_confidence=1.0,
        raw_ocr_text=req.raw_text,
        cleaned_text=cleaned,
        source_metadata=metadata,
    )
