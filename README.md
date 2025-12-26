# AI Expense Tracker

A sophisticated, AI-powered expense tracking application that revolutionizes personal finance management through intelligent receipt processing, predictive analytics, and comprehensive financial insights.

## Project Vision & Mission

Transform personal finance management by automating expense tracking through cutting-edge AI technologies. Our mission is to provide users with intelligent financial insights that help them make better spending decisions and achieve their financial goals.

## Complete User Workflow Journey

### 1. **User Onboarding & Authentication**
- Secure registration with email verification
- JWT-based authentication system
- Personalized user profiles with financial preferences

### 2. **Dashboard Overview & Analytics**
- Real-time expense tracking and visualization
- Interactive charts showing spending patterns
- Category-wise expense breakdown
- Monthly and yearly financial summaries

### 3. **Multiple Expense Entry Methods**
- **Manual Entry**: Traditional form-based expense logging
- **AI-Powered OCR**: Upload receipt images for automatic data extraction
- **Quick Entry**: Simplified interface for rapid expense recording

### 4. **Intelligent Receipt Processing**
- Image upload with drag-and-drop interface
- Multi-service OCR integration (Google Cloud, Azure, LLM7)
- Automatic data validation and correction
- Smart categorization based on merchant and item types

### 5. **Predictive Analytics & Insights**
- Machine Learning-powered spending predictions
- Overspend alerts and budget recommendations
- Trend analysis and anomaly detection
- Personalized financial advice

### 6. **Reporting & Export**
- PDF report generation with detailed analytics
- Custom date range filtering
- Export to various formats (PDF, CSV)
- Shareable financial summaries

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + SQLAlchemy
- **Database**: PostgreSQL
- **AI/ML**: Hugging Face Transformers (LayoutLM) + scikit-learn
- **State Management**: Redux Toolkit
- **UI**: Tailwind CSS + Recharts

## Features
- User authentication (JWT)
- Manual expense logging
- AI-assisted receipt OCR extraction
- Spending predictions and analytics
- PDF export functionality
- Responsive design

## Setup Instructions

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/expenses_db
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## API Endpoints
- Authentication: `/auth/login`, `/auth/register`, `/auth/me`
- Expenses: `/expenses`, `/expenses/{id}`, `/expenses/summary/{year}/{month}`
- Predictions: `/expenses/predict/{category}`, `/expenses/predict`
- OCR: `/ocr/extract`

## Database Schema
- `users`: User accounts with email/password
- `expenses`: Expense records with amount, category, date, notes

## Docker Setup

### Project Structure
- `docker-compose.yml` - Main Docker Compose configuration (root directory)
- `backend/Dockerfile` - Backend service configuration
- `frontend/` - Frontend service (served via Vite dev server)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) - Install Docker Engine for your operating system
- [Docker Compose](https://docs.docker.com/compose/install/) - Install Docker Compose (included with Docker Desktop for Windows/Mac)

  Verify installation:
  ```bash
  docker --version
  docker-compose --version
  ```

### Running with Docker

1. Clone the repository and navigate to the project root:
   ```bash
   git clone <repository-url>
   cd aiexpensetracker
   ```

2. Start the services:
   ```bash
   docker-compose up --build
   ```

3. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - PostgreSQL: localhost:5432 (username: postgres, password: postgres)

4. To stop the containers:
   ```bash
   docker-compose down
   ```
   
   To also remove volumes (including database data):
   ```bash
   docker-compose down -v
   ```

### Development
For development with hot-reloading, the backend is already configured with `--reload` flag in the docker-compose file. The frontend should be run separately for the best development experience:

```bash
# In one terminal - start backend with hot-reload
docker-compose up backend

# In another terminal - start frontend dev server
cd frontend
npm install
npm run dev
```

## Deployment
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway with PostgreSQL
- Update CORS settings in backend for production URLs

## Development Notes
- Backend runs on port 8000
- Frontend runs on port 5173
- API documentation available at `http://localhost:8000/docs`
- Database migrations managed with Alembic

## License
MIT License
