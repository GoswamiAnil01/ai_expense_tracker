# Deployment Guide

## Railway Deployment

### Prerequisites
- Railway account
- GitHub repository connected to Railway

### Steps
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `railway.toml` configuration
3. The deployment will use the specified Docker Compose setup
4. Frontend will be served from port 3000
5. Backend API will be available at port 8000

### Environment Variables
Set these in Railway dashboard:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Render Deployment

### Prerequisites
- Render account
- GitHub repository connected to Render

### Steps
1. Connect your GitHub repository to Render
2. Render will use the `render.yaml` configuration
3. Web Service will be created for the application
4. Database will be provisioned if needed

### Environment Variables
Configure in Render dashboard:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Docker Deployment

### Local Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.yml up -d --build
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is correctly formatted
2. **Port Conflicts**: Check if ports 3000 and 8000 are available
3. **Environment Variables**: Verify all required variables are set
4. **Build Failures**: Check logs for specific error messages

### Health Checks
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/health
- Database: Connection test via application logs
