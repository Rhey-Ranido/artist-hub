# Art Studio Backend Setup

## Quick Setup Guide

### 1. Create Environment File
Create a `.env` file in the `backend` directory with these variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/artstudio
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
```bash
npm run dev
```

### 4. Test the API (Optional)
```bash
node test-auth.js
```

### 5. Seed Sample Data (Optional)
```bash
npm run seed-art
```

## Common Issues & Solutions

### "Failed to fetch" Error
- ✅ Make sure backend server is running on port 5000
- ✅ Check that MongoDB is connected
- ✅ Verify .env file exists with correct variables
- ✅ Check browser console for CORS errors

### Registration/Login Issues
- ✅ Username must be 3-30 characters
- ✅ Password must be at least 6 characters
- ✅ Email must be valid format
- ✅ Check MongoDB connection

### Server Won't Start
- ✅ Check if port 5000 is already in use
- ✅ Verify MongoDB is running
- ✅ Check .env file exists
- ✅ Run `npm install` to ensure dependencies

## Test Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```