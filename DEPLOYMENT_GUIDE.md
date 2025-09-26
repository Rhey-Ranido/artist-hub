# Vercel Deployment Guide for ArtCaps

This guide will help you deploy both your frontend (React + Vite) and backend (Node.js + Express) to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your project should be pushed to a GitHub repository
3. **Environment Variables**: Have your MongoDB URI and other secrets ready

## Deployment Options

You have two main options for deployment:

### Option 1: Monorepo Deployment (Recommended)
Deploy both frontend and backend from the same repository.

### Option 2: Separate Deployments
Deploy frontend and backend as separate Vercel projects.

---

## Option 1: Monorepo Deployment

### Step 1: Configure Environment Variables
1. Go to your Vercel dashboard
2. Import your GitHub repository
3. Add these environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: 3000 (or your preferred port)
   - `NODE_ENV`: production
   - `FRONTEND_URL`: https://your-project-name.vercel.app

### Step 2: Deploy
1. Vercel will automatically detect the `vercel.json` configuration
2. It will build both frontend and backend
3. API routes will be available at `/api/*`
4. Frontend will be served from the root `/`

---

## Option 2: Separate Deployments

### Backend Deployment

1. **Create a new Vercel project** for your backend:
   ```bash
   cd backend
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT`
   - `NODE_ENV=production`
   - `FRONTEND_URL` (will be your frontend URL)

3. **Your backend will be available** at: `https://your-backend.vercel.app`

### Frontend Deployment

1. **Update API Base URL** in your frontend:
   Create a `.env.production` file in the frontend directory:
   ```
   VITE_API_BASE_URL=https://your-backend.vercel.app
   ```

2. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Update Backend CORS**: Update the `FRONTEND_URL` environment variable in your backend with your frontend URL.

---

## Frontend Environment Setup

⚠️ **IMPORTANT**: Your frontend now uses environment variables for API configuration.

### Create Environment Files

Create these files in your `frontend/` directory:

**1. `frontend/.env.development`**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:3000
```

**2. `frontend/.env.production`**
```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=
```

**3. `frontend/.env.example`**
```env
# Environment Variables Example
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Updated API Configuration

Your frontend now uses a centralized API configuration system:
- All API URLs are now managed in `frontend/src/config/api.js`
- Environment variables automatically configure URLs for development and production
- No more hardcoded localhost URLs scattered throughout the code

---

## Important Configuration Files

### Root `vercel.json` (For Monorepo)
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

### Backend `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Frontend `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

---

## Environment Variables Needed

### Backend Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: 3000 (default)
- `NODE_ENV`: production
- `FRONTEND_URL`: Your frontend URL for CORS

### Frontend Environment Variables
- `VITE_API_BASE_URL`: Your backend URL (automatically configured for Vercel)
- `VITE_SOCKET_URL`: Socket.IO server URL (automatically configured for Vercel)

---

## File Upload Considerations

⚠️ **Important**: Vercel has limitations with file uploads:

1. **Serverless Functions**: Files uploaded to Vercel functions are not persistent
2. **File Storage**: Consider using cloud storage services like:
   - AWS S3
   - Cloudinary
   - Vercel Blob Storage

### Recommended: Update to Cloud Storage

For production, update your image upload system to use cloud storage instead of local file system. Your current `uploads/` folder won't persist on Vercel.

---

## Deployment Commands

### Quick Deploy (Monorepo)
```bash
# From project root
vercel --prod
```

### Deploy Backend Only
```bash
cd backend
vercel --prod
```

### Deploy Frontend Only
```bash
cd frontend
vercel --prod
```

---

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database connection is working
- [ ] API endpoints are accessible
- [ ] Frontend can communicate with backend
- [ ] File uploads are working (or migrated to cloud storage)
- [ ] Socket.io connections are working
- [ ] CORS is configured for your domain

---

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Update `FRONTEND_URL` in backend environment variables
2. **API Not Found**: Check your `vercel.json` routes configuration
3. **Build Failures**: Ensure all dependencies are in `package.json`
4. **File Upload Issues**: Migrate to cloud storage for production

### Useful Commands:
```bash
# Check deployment logs
vercel logs

# Set environment variable
vercel env add MONGO_URI

# Remove deployment
vercel remove
```

---

## Next Steps

1. Deploy using your preferred option
2. Test all functionality
3. Update any hardcoded URLs
4. Consider implementing cloud storage for file uploads
5. Set up monitoring and error tracking

Good luck with your deployment! 🚀
