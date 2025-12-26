# Vercel Deployment Guide for AI Expense Tracker

## Overview
Deploy the AI Expense Tracker with:
- Frontend: Vercel (React/Vite)
- Backend: Vercel (FastAPI)
- Database: Neon PostgreSQL

## Prerequisites
1. Vercel account
2. Neon database account
3. GitHub repository (optional but recommended)

## Step 1: Set up Neon Database

1. Create a new Neon project at https://neon.tech
2. Get your connection string from Neon dashboard
3. Run database migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```

## Step 2: Deploy Backend to Vercel

1. Push your code to GitHub
2. Import the backend directory to Vercel
3. Set environment variables in Vercel dashboard:
   - `neon_database_url`: Your Neon connection string
   - `jwt_secret`: Generate a secure JWT secret
   - `frontend_url`: Your frontend URL (after deployment)
   - `llm7_api_key`: Your LLM7 API key (optional)

## Step 3: Deploy Frontend to Vercel

1. Import the frontend directory to Vercel
2. Set environment variable:
   - `backend_url`: Your deployed backend URL

## Step 4: Configure CORS

Update backend ALLOWED_ORIGINS to include your frontend URL.

## Environment Variables

### Backend (Vercel)
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secure random string for JWT tokens
- `ALLOWED_ORIGINS`: Frontend URL(s)
- `LLM7_API_KEY`: For OCR functionality

### Frontend (Vercel)
- `VITE_API_URL`: Backend API URL

## Post-Deployment

1. Test authentication endpoints
2. Verify database connectivity
3. Test OCR functionality
4. Check frontend-backend integration
