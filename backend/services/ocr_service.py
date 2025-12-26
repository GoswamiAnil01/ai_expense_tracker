import os
import base64
import re
from typing import Dict, Any
from PIL import Image
import requests
import json

# Get API keys from environment
LLM7_API_KEY = os.getenv("LLM7_API_KEY", "unused")  # Default to "unused" as per example
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")
AZURE_VISION_API_KEY = os.getenv("AZURE_VISION_API_KEY")
AZURE_VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT")

def get_available_service():
    """Check which AI service is available"""
    if LLM7_API_KEY:
        return "llm7"
    elif GOOGLE_CLOUD_API_KEY:
        return "google"
    elif AZURE_VISION_API_KEY and AZURE_VISION_ENDPOINT:
        return "azure"
    else:
        return None

def extract_from_image(image_path: str) -> Dict[str, Any]:
    """
    Extract text and structured data from receipt image using cloud AI services
    
    Args:
        image_path: Path to the receipt image
        
    Returns:
        Dictionary containing extracted data with keys:
        - amount: float - extracted amount
        - category: str - categorized expense type
        - confidence: float - confidence score
        - raw_text: str - extracted raw text
    """
    service = get_available_service()
    
    if not service:
        return {
            "amount": 0.0,
            "category": "other",
            "confidence": 0.0,
            "raw_text": "No AI service configured. Please add an API key to your .env file (LLM7_API_KEY, GOOGLE_CLOUD_API_KEY, or AZURE_VISION_API_KEY)"
        }
    
    try:
        if service == "llm7":
            return extract_with_llm7(image_path)
        elif service == "google":
            return extract_with_google_vision(image_path)
        elif service == "azure":
            return extract_with_azure_vision(image_path)
        else:
            return {
                "amount": 0.0,
                "category": "other",
                "confidence": 0.0,
                "raw_text": "Unsupported AI service"
            }
    except Exception as e:
        print(f"Error processing image with {service}: {e}")
        return {
            "amount": 0.0,
            "category": "other",
            "confidence": 0.0,
            "raw_text": f"Error: {str(e)}"
        }

def extract_with_llm7(image_path: str) -> Dict[str, Any]:
    """Extract text from image using LLM7.io API"""
    try:
        # Convert image to base64
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "default",  # Can also use "fast" or "pro" models
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Please analyze this receipt image and extract the following information in JSON format:
{
  "amount": <total amount as a number>,
  "category": <one of: food, travel, entertainment, shopping, healthcare, utilities, education, other>,
  "confidence": <confidence score 0-1>,
  "raw_text": <extracted text>
}

Focus on finding the total amount and categorize the expense based on the merchant type."""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 500
        }
        
        response = requests.post(
            "https://api.llm7.io/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Try to parse JSON from the response
            try:
                extracted_data = json.loads(content)
                return extracted_data
            except:
                # Fallback: extract amount from text
                amount = extract_amount(content)
                category = categorize_expense(content)
                return {
                    "amount": amount,
                    "category": category,
                    "confidence": 0.7,
                    "raw_text": content
                }
        else:
            raise Exception(f"LLM7 API error: {response.status_code} - {response.text}")
            
    except Exception as e:
        raise Exception(f"LLM7 extraction failed: {str(e)}")

def extract_with_google_vision(image_path: str) -> Dict[str, Any]:
    """Extract text from image using Google Cloud Vision API"""
    try:
        # Convert image to base64
        with open(image_path, "rb") as image_file:
            content = base64.b64encode(image_file.read()).decode('utf-8')
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "requests": [
                {
                    "image": {
                        "content": content
                    },
                    "features": [
                        {
                            "type": "TEXT_DETECTION"
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(
            f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_CLOUD_API_KEY}",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            text = result['responses'][0]['fullTextAnnotation']['text']
            
            amount = extract_amount(text)
            category = categorize_expense(text)
            
            return {
                "amount": amount,
                "category": category,
                "confidence": 0.8,
                "raw_text": text
            }
        else:
            raise Exception(f"Google Vision API error: {response.status_code} - {response.text}")
            
    except Exception as e:
        raise Exception(f"Google Vision extraction failed: {str(e)}")

def extract_with_azure_vision(image_path: str) -> Dict[str, Any]:
    """Extract text from image using Azure Computer Vision API"""
    try:
        # Convert image to base64
        with open(image_path, "rb") as image_file:
            content = base64.b64encode(image_file.read()).decode('utf-8')
        
        headers = {
            "Ocp-Apim-Subscription-Key": AZURE_VISION_API_KEY,
            "Content-Type": "application/octet-stream"
        }
        
        response = requests.post(
            f"{AZURE_VISION_ENDPOINT}vision/v3.2/ocr",
            headers=headers,
            data=content
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract text from Azure response
            text_lines = []
            for region in result.get('regions', []):
                for line in region.get('lines', []):
                    words = [word.get('text', '') for word in line.get('words', [])]
                    text_lines.append(' '.join(words))
            
            text = '\n'.join(text_lines)
            
            amount = extract_amount(text)
            category = categorize_expense(text)
            
            return {
                "amount": amount,
                "category": category,
                "confidence": 0.8,
                "raw_text": text
            }
        else:
            raise Exception(f"Azure Vision API error: {response.status_code} - {response.text}")
            
    except Exception as e:
        raise Exception(f"Azure Vision extraction failed: {str(e)}")

def extract_amount(text: str) -> float:
    """Extract monetary amount from text using regex"""
    # Look for patterns like $12.34, 12.34, 12,34, etc.
    amount_patterns = [
        r'\$?(\d+(?:,\d{3})*(?:\.\d{2})?)',  # $1,234.56 or 1,234.56
        r'(\d+(?:\.\d{2})?)\s*(?:USD|dollars?)',  # 12.34 USD
        r'total[:\s]*\$?(\d+(?:\.\d{2})?)',  # total: $12.34
        r'amount[:\s]*\$?(\d+(?:\.\d{2})?)',  # amount: $12.34
    ]
    
    for pattern in amount_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            # Clean up the amount string and convert to float
            amount_str = matches[0].replace(',', '')
            try:
                return float(amount_str)
            except ValueError:
                continue
    
    return 0.0

def categorize_expense(text: str) -> str:
    """Categorize expense based on keywords in extracted text"""
    text_lower = text.lower()
    
    # Category keywords
    categories = {
        "food": ["restaurant", "food", "dining", "meal", "lunch", "dinner", "breakfast", "cafe", "coffee", "pizza", "burger"],
        "travel": ["hotel", "flight", "airline", "taxi", "uber", "lyft", "rental car", "gas", "parking", "airport"],
        "entertainment": ["movie", "theater", "concert", "show", "ticket", "netflix", "spotify", "game"],
        "shopping": ["store", "retail", "clothing", "shoes", "electronics", "amazon", "walmart", "target"],
        "healthcare": ["pharmacy", "medical", "doctor", "hospital", "clinic", "medicine", "health"],
        "utilities": ["electric", "water", "gas", "internet", "phone", "cable", "utility"],
        "education": ["book", "course", "tuition", "school", "university", "education"]
    }
    
    # Check for category keywords
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category
    
    return "other"
