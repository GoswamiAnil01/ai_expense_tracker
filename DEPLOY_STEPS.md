# Step-by-Step Vercel Deployment Guide

## 1. Prepare Your Code
```bash
cd aiexpensetracker
git add .
git commit -m "Ready for Vercel deployment"
git push origin master
```

## 2. Set Up Neon Database
1. Go to https://neon.tech
2. Sign up/login
3. Create new project
4. Copy the connection string (looks like: postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname)

## 3. Deploy Backend (FIRST)
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. **IMPORTANT**: Set "Root Directory" to `backend`
5. Framework: Python
6. Build Command: leave empty
7. Output Directory: leave empty
8. Install Command: `pip install -r requirements.txt`

### Backend Environment Variables:
- `DATABASE_URL`: Your Neon connection string
- `JWT_SECRET`: Generate at https://www.uuidgenerator.net/
- `ALLOWED_ORIGINS`: `https://your-frontend-url.vercel.app` (set after frontend)
- `LLM7_API_KEY`: Get from https://token.llm7.io/ (optional)

9. Click Deploy
10. Copy the deployed URL (save it for frontend)

## 4. Deploy Frontend (SECOND)
1. Go to Vercel dashboard
2. Click "New Project"
3. Import same GitHub repo
4. **IMPORTANT**: Set "Root Directory" to `frontend`
5. Framework: Vite
6. Build Command: `npm run build`
7. Output Directory: `dist`

### Frontend Environment Variables:
- `VITE_API_URL`: Your backend URL (from step 3)

8. Click Deploy
9. Copy the frontend URL

## 5. Update Backend CORS
1. Go back to your backend project on Vercel
2. Go to Settings → Environment Variables
3. Update `ALLOWED_ORIGINS` with your frontend URL
4. Redeploy

## 6. Test Everything
- Frontend: https://your-frontend.vercel.app
- Backend API: https://your-backend.vercel.app/health
- API Docs: https://your-backend.vercel.app/docs

## Troubleshooting
- If backend fails: Check logs in Vercel dashboard
- If CORS errors: Ensure ALLOWED_ORIGINS includes frontend URL
- If database errors: Verify Neon connection string format
