# AI Expense Tracker Backend

A FastAPI-based backend service for the AI Expense Tracker application, providing RESTful APIs for expense management, user authentication, and OCR processing.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Expense Management**: CRUD operations for expense records
- **OCR Processing**: Extract expense data from receipt images using OCR technology
- **Database Integration**: PostgreSQL database with SQLAlchemy ORM
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: JWT tokens
- **OCR**: Tesseract OCR engine
- **File Upload**: Support for receipt image uploads
- **CORS**: Cross-origin resource sharing for frontend integration

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Expenses
- `GET /expenses/` - Get all expenses for user
- `POST /expenses/` - Create new expense
- `GET /expenses/{expense_id}` - Get specific expense
- `PUT /expenses/{expense_id}` - Update expense
- `DELETE /expenses/{expense_id}` - Delete expense

### OCR Processing
- `POST /ocr/extract` - Extract data from receipt image

## Installation

1. Clone the repository
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (copy `.env.example` to `.env`)
5. Run database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Docker

Build and run with Docker:
```bash
docker build -t ai-expense-tracker-backend .
docker run -p 8000:8000 ai-expense-tracker-backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
