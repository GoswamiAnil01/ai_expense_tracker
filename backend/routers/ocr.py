from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any
import os
import tempfile
from pydantic import BaseModel

from database import get_db
from routers.auth import get_current_user
from models.base import User
from services.ocr_service import extract_from_image

# Pydantic models
class OCRResponse(BaseModel):
    amount: float
    category: str
    confidence: float
    raw_text: str

# Router
router = APIRouter()

@router.post("/extract", response_model=OCRResponse)
async def extract_receipt_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    file_content = await file.read()
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
        temp_file.write(file_content)
        temp_file_path = temp_file.name
    
    try:
        # Extract data using OCR service
        extracted_data = extract_from_image(temp_file_path)
        
        return OCRResponse(
            amount=extracted_data.get("amount", 0.0),
            category=extracted_data.get("category", "other"),
            confidence=extracted_data.get("confidence", 0.0),
            raw_text=extracted_data.get("raw_text", "")
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
