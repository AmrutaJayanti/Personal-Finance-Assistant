import re
from PIL import Image
import pytesseract
import pdfplumber
import cv2
import numpy as np
import fitz  # PyMuPDF
from fastapi import UploadFile
from datetime import datetime
from dateutil import parser


# This file defines functions to extract text from images and PDFs, specifically for parsing receipts.

def preprocess_image(file_bytes):                                                  # Preprocess the image for better OCR results
    file_bytes = np.asarray(bytearray(file_bytes), dtype=np.uint8)                 # Convert bytes to numpy array
    image = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)                         # Convert to grayscale
    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)     # Resize image
    image = cv2.GaussianBlur(image, (3, 3), 0)                                     # Apply Gaussian blur
    _, image = cv2.threshold(image, 180, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU) # Apply binary thresholding
    return Image.fromarray(image)  


def correct_price(price_str):                                                      # Correct the price format from the OCR output                              
    try:
        price_str = re.sub(r'[^\d.]', '', price_str)                               # Remove any non-numeric characters except for '.'
        price = float(price_str)                                                   # Convert to float
        if '.' not in price_str and len(price_str) >= 4:                           # If no decimal point and length is 4 or more, assume last two digits are cents   
            corrected = float(price_str[:-2] + "." + price_str[-2:])               # Correct the price format
            return corrected
        return price
    except:
        return None


def extract_text_from_image(file: UploadFile):                                   # Extract text from an image file using OCR
    raw_bytes = file.file.read()                                                 # Read the file bytes
    processed_img = preprocess_image(raw_bytes)                                  # Preprocess the image for better OCR results   

    text = pytesseract.image_to_string(                                          # Perform OCR on the preprocessed image
        processed_img,
        config="--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.:/-"
    )

    lines = text.splitlines()
    transactions = []
    item_pattern = re.compile(r"(.+?)\s+(\d+)\s+(\d+(?:\.\d+)?)")

    for line in lines:
        match = item_pattern.search(line.strip())                               # Match the line against the pattern to extract item details
        # Example line: "Item Name 2 123.45"
        if match:
            name = match.group(1).strip()
            qty = match.group(2).strip()
            price = correct_price(match.group(3).strip())

            if not price:
                continue

            transactions.append({
                "title": name or "Untitled",
                "type": "expense",
                "amount": price,
                "category": name.split()[0] if name else "Misc",
                "description": f"Item(s) @ ₹{price:.2f}",
                "date": datetime.now()
            })

    return transactions


def extract_table_from_pdf(file: UploadFile):
    pdf_bytes = file.file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    transactions = []

    for page in doc:
        words = page.get_text("words")  # returns [x0, y0, x1, y1, "word", block_no, line_no, word_no]
        words.sort(key=lambda w: (w[1], w[0]))  # sort by y, then x

        lines = {}
        for w in words:
            y = round(w[1], 1)
            if y not in lines:
                lines[y] = []
            lines[y].append(w[4])

        for parts in lines.values():
            if len(parts) >= 5 and parts[0].count("-") == 2:
                try:
                    date = parser.parse(parts[0], dayfirst=False)
                    trans_type = parts[1].lower()
                    amount = float(parts[2].replace("Rs.", "").replace("₹", "").replace(",", ""))
                    category = parts[3]
                    description = " ".join(parts[4:])

                    transactions.append({
                        "title": description or "Untitled",
                        "type": trans_type,
                        "amount": amount,
                        "category": category,
                        "description": description,
                        "date": date
                    })
                except Exception as e:
                    print("Skipping:", parts, "Reason:", e)
                    continue

    return transactions


def extract_text_from_pdf_as_image(file: UploadFile):                           # Extract text from a PDF file by converting each page to an image and applying OCR
    file.file.seek(0)
    doc = fitz.open(stream=file.file.read(), filetype="pdf")
    transactions = []

    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        text = pytesseract.image_to_string(
            img,
            config="--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.:/-"
        )

        lines = text.splitlines()
        item_pattern = re.compile(r"(.+?)\s+(\d+)\s+(\d+(?:\.\d+)?)")

        for line in lines:
            match = item_pattern.search(line.strip())
            if match:
                name = match.group(1).strip()
                qty = match.group(2).strip()
                price = correct_price(match.group(3).strip())

                if not price:
                    continue

                transactions.append({
                    "title": name or "Untitled",
                    "type": "expense",
                    "amount": price,
                    "category": name.split()[0] if name else "Misc",
                    "description": f"Item(s) @ ₹{price:.2f}",
                    "date": datetime.now()
                })

    return transactions
