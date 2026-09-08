import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.ocr import ocr_engine
from app.schema import SourceType, IngestedNotification, DetectedLanguage
from tests.generate_sample_image import generate_sample_document_image

def run_ocr_test():
    sample_dir = Path(__file__).parent / "sample_notifications" / "en"
    image_path = sample_dir / "sample_notification_en.png"

    if not image_path.exists():
        print("Generating realistic sample document image...")
        generate_sample_document_image(image_path)

    print("=" * 75)
    print("LAYER 1: Multilingual Ingestion & Digitization - Tesseract OCR Test")
    print("=" * 75)
    print(f"Target Image: {image_path}")
    print(f"File Size: {image_path.stat().st_size} bytes")

    # Run OCR extraction
    print("\nRunning Tesseract OCR extraction...")
    ocr_result = ocr_engine.extract_from_image(image_path, languages="eng")

    print(f"Pages Processed: {ocr_result.page_count}")
    if ocr_result.pages:
        page1 = ocr_result.pages[0]
        print(f"Page 1 Confidence Score: {page1.confidence}%")

    print("\n" + "-" * 75)
    print("RAW EXTRACTED OCR TEXT:")
    print("-" * 75)
    print(ocr_result.raw_text.strip())
    print("-" * 75)

    # Test schema serialization
    notification_id = IngestedNotification.generate_notification_id(ocr_result.raw_text)
    metadata = IngestedNotification.create_metadata(
        source_name=image_path.name,
        source_type=SourceType.SCANNED_IMAGE,
        page_count=ocr_result.page_count,
        file_size_bytes=image_path.stat().st_size,
    )

    ingested = IngestedNotification(
        notification_id=notification_id,
        source_type=SourceType.SCANNED_IMAGE,
        detected_language=DetectedLanguage.EN,
        language_confidence=0.99,
        raw_ocr_text=ocr_result.raw_text,
        cleaned_text=ocr_result.raw_text.strip(),  # Cleaner will refine this in next step
        source_metadata=metadata,
    )

    print("\nSCHEMA VALIDATION:")
    print(f"  • Notification ID: {ingested.notification_id}")
    print(f"  • Source Type: {ingested.source_type.value}")
    print(f"  • Detected Language: {ingested.detected_language.value} (Confidence: {ingested.language_confidence})")
    print(f"  • Raw Character Count: {len(ingested.raw_ocr_text)}")
    print(f"  • Cleaned Character Count: {len(ingested.cleaned_text)}")
    print("Schema validated successfully!")
    print("=" * 75)

    return ocr_result.raw_text

if __name__ == "__main__":
    run_ocr_test()
