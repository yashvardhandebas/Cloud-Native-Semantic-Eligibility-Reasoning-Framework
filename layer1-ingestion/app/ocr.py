import io
import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional, Sequence, Union
from PIL import Image
import pytesseract

from app.config import settings
from app.schema import OCRResult, PageOCRResult

logger = logging.getLogger(__name__)

# Standard language code mapping between ISO-639-1 and Tesseract codes
LANG_CODE_MAP = {
    "en": "eng",
    "hi": "hin",
    "ta": "tam",
    "te": "tel",
    "eng": "eng",
    "hin": "hin",
    "tam": "tam",
    "tel": "tel",
}


def load_image(image_input: Union[Image.Image, bytes, str, Path]) -> Image.Image:
    """Load an image from various input types into a PIL Image."""
    if isinstance(image_input, Image.Image):
        return image_input.convert("RGB")
    if isinstance(image_input, (str, Path)):
        return Image.open(str(image_input)).convert("RGB")
    if isinstance(image_input, bytes):
        return Image.open(io.BytesIO(image_input)).convert("RGB")
    raise ValueError(f"Unsupported image input type: {type(image_input)}")


def pdf_to_images(pdf_input: Union[bytes, str, Path], scale: float = 3.0) -> List[Image.Image]:
    """
    Render PDF pages to PIL Images.
    Uses pypdfium2 with automatic fallback to pdf2image.
    """
    try:
        import pypdfium2 as pdfium
        if isinstance(pdf_input, (str, Path)):
            doc = pdfium.PdfDocument(str(pdf_input))
        else:
            doc = pdfium.PdfDocument(pdf_input)

        pages = [page.render(scale=scale).to_pil().convert("RGB") for page in doc]
        if pages:
            return pages
    except ImportError:
        logger.debug("pypdfium2 not available, attempting pdf2image fallback")
    except Exception as e:
        logger.warning(f"pypdfium2 rendering failed ({e}), attempting pdf2image fallback")

    try:
        from pdf2image import convert_from_bytes, convert_from_path
        if isinstance(pdf_input, bytes):
            return convert_from_bytes(pdf_input, dpi=int(scale * 72))
        return convert_from_path(str(pdf_input), dpi=int(scale * 72))
    except Exception as e:
        raise RuntimeError(
            f"Failed to render PDF to images. Ensure pypdfium2 or pdf2image + poppler is installed: {e}"
        ) from e


class BaseOCREngine(ABC):
    """Abstract interface for OCR extraction engines (Tesseract, Cloud Vision, etc.)."""

    @abstractmethod
    def extract_from_image(
        self,
        image: Union[Image.Image, bytes, str, Path],
        languages: Optional[Union[str, Sequence[str]]] = None,
    ) -> OCRResult:
        """Extract text from a single image."""
        pass

    @abstractmethod
    def extract_from_pdf(
        self,
        pdf_input: Union[bytes, str, Path],
        languages: Optional[Union[str, Sequence[str]]] = None,
    ) -> OCRResult:
        """Extract text from a multi-page PDF document."""
        pass

    def extract(
        self,
        content_or_path: Union[bytes, str, Path],
        mime_or_ext: str,
        languages: Optional[Union[str, Sequence[str]]] = None,
    ) -> OCRResult:
        """Generic extraction dispatcher based on mime type or file extension."""
        clean_ext = mime_or_ext.lower().strip().replace(".", "")
        if "pdf" in clean_ext:
            return self.extract_from_pdf(content_or_path, languages=languages)
        return self.extract_from_image(content_or_path, languages=languages)


class TesseractOCREngine(BaseOCREngine):
    """Tesseract-based local OCR engine with multilingual support and resilience."""

    def __init__(self, tesseract_cmd: Optional[str] = None):
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        elif settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

    def _resolve_tesseract_languages(
        self, requested: Optional[Union[str, Sequence[str]]]
    ) -> str:
        """
        Resolve requested languages against installed Tesseract traineddata packs.
        Gracefully falls back to available packs if some languages are uninstalled.
        """
        try:
            available = set(pytesseract.get_languages())
        except Exception:
            available = {"eng"}

        if not requested:
            requested = settings.DEFAULT_OCR_LANGUAGES

        # Normalize requested languages to list of codes
        if isinstance(requested, str):
            req_codes = [c.strip() for c in requested.replace("+", ",").split(",") if c.strip()]
        else:
            req_codes = list(requested)

        # Map 2-letter codes (en, hi, ta, te) to Tesseract 3-letter codes (eng, hin, tam, tel)
        tess_codes = [LANG_CODE_MAP.get(c.lower(), c.lower()) for c in req_codes]

        valid_codes = [c for c in tess_codes if c in available]
        if not valid_codes:
            if "eng" in available:
                valid_codes = ["eng"]
            elif available:
                valid_codes = [list(available)[0]]
            else:
                valid_codes = ["eng"]
            logger.warning(
                f"Requested languages {req_codes} not available in Tesseract. Falling back to: {valid_codes}"
            )

        return "+".join(valid_codes)

    def _ocr_single_image(
        self,
        image: Image.Image,
        page_num: int,
        lang_str: str,
    ) -> PageOCRResult:
        """Run Tesseract on a single PIL Image and compute confidence metrics."""
        raw_text = pytesseract.image_to_string(image, lang=lang_str)

        # Calculate average word confidence
        confidence: Optional[float] = None
        try:
            data = pytesseract.image_to_data(
                image,
                lang=lang_str,
                output_type=pytesseract.Output.DICT,
            )
            confs = [
                float(c)
                for c in data.get("conf", [])
                if isinstance(c, (int, float, str)) and float(c) > 0
            ]
            if confs:
                confidence = round(sum(confs) / len(confs), 2)
        except Exception as e:
            logger.debug(f"Could not compute word confidence: {e}")

        return PageOCRResult(
            page_number=page_num,
            raw_text=raw_text,
            confidence=confidence,
        )

    def extract_from_image(
        self,
        image: Union[Image.Image, bytes, str, Path],
        languages: Optional[Union[str, Sequence[str]]] = None,
    ) -> OCRResult:
        """Extract text from a single image."""
        pil_img = load_image(image)
        lang_str = self._resolve_tesseract_languages(languages)
        page_result = self._ocr_single_image(pil_img, page_num=1, lang_str=lang_str)

        return OCRResult(
            raw_text=page_result.raw_text,
            page_count=1,
            pages=[page_result],
        )

    def extract_from_pdf(
        self,
        pdf_input: Union[bytes, str, Path],
        languages: Optional[Union[str, Sequence[str]]] = None,
    ) -> OCRResult:
        """Render multi-page PDF to images and extract text across all pages."""
        scale = settings.OCR_DPI / 72.0
        images = pdf_to_images(pdf_input, scale=scale)
        if not images:
            return OCRResult(raw_text="", page_count=0, pages=[])

        lang_str = self._resolve_tesseract_languages(languages)
        pages: List[PageOCRResult] = []

        for idx, img in enumerate(images, start=1):
            page_res = self._ocr_single_image(img, page_num=idx, lang_str=lang_str)
            pages.append(page_res)

        full_text = "\n\n".join(p.raw_text.strip() for p in pages if p.raw_text.strip())

        return OCRResult(
            raw_text=full_text,
            page_count=len(pages),
            pages=pages,
        )


# Global default OCR engine instance
ocr_engine = TesseractOCREngine()
