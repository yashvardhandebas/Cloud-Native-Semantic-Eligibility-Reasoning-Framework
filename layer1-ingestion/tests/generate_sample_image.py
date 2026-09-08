import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

def generate_sample_document_image(output_path: Path) -> Path:
    """Generate a realistic government welfare notification document image."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    width = 1600
    height = 1400
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Try loading Arial font from Windows Fonts, or fallback to default
    try:
        title_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 36)
        sub_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
        body_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 22)
    except Exception:
        title_font = ImageFont.load_default()
        sub_font = title_font
        body_font = title_font

    lines = [
        ("GOVERNMENT OF INDIA", title_font, (20, 20, 20), 40),
        ("Ministry of Agriculture & Farmers Welfare", sub_font, (60, 60, 60), 30),
        ("Notification No: AGRI-2024-PMK-001", body_font, (100, 100, 100), 40),
        ("PRADHAN MANTRI KISAN SAMMAN NIDHI (PM-KISAN)", title_font, (0, 45, 98), 45),
        ("OPERATIONAL GUIDELINES & ELIGIBILITY CRITERIA", sub_font, (30, 30, 30), 35),
        ("", body_font, (0, 0, 0), 20),
        ("1. All landholding farmer families who hold cultivable land in their names as per state", body_font, (20, 20, 20), 28),
        ("   land records are eligible for financial assistance under this scheme.", body_font, (20, 20, 20), 32),
        ("2. The beneficiary family will receive an income support benefit of Rs. 6000 per annum,", body_font, (20, 20, 20), 28),
        ("   disbursed in three equal installments of Rs. 2000 every four months via DBT.", body_font, (20, 20, 20), 32),
        ("3. Mandatory documents required for registration and verification:", body_font, (20, 20, 20), 28),
        ("   - Valid Aadhaar Card linked to active mobile number.", body_font, (20, 20, 20), 28),
        ("   - Land ownership passbook/record (Patta / Khatauni).", body_font, (20, 20, 20), 28),
        ("   - Active Bank Passbook details verified with Aadhaar.", body_font, (20, 20, 20), 35),
        ("4. Exclusions / Ineligible Categories:", body_font, (20, 20, 20), 28),
        ("   - All institutional landholders.", body_font, (20, 20, 20), 28),
        ("   - Farmer families where one or more members hold constitutional posts.", body_font, (20, 20, 20), 28),
        ("   - All persons who paid Income Tax in the last assessment year.", body_font, (20, 20, 20), 28),
        ("   - Former or retired officers and employees of central/state government departments.", body_font, (20, 20, 20), 35),
        ("Published by Authority, New Delhi | Date: 15-January-2024", body_font, (120, 120, 120), 20),
    ]

    # Draw border
    draw.rectangle([(40, 40), (width - 40, height - 40)], outline=(180, 180, 180), width=3)

    y = 80
    for text, font, color, spacing in lines:
        if text:
            draw.text((80, y), text, fill=color, font=font)
        y += spacing

    image.save(output_path, format="PNG")
    return output_path

if __name__ == "__main__":
    target = Path(__file__).parent / "sample_notifications" / "en" / "sample_notification_en.png"
    generate_sample_document_image(target)
    print(f"Sample image created at {target}")
