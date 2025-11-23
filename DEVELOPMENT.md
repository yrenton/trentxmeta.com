# Creator Ranking Application

## Local Development

### Frontend
```bash
cd creator-ranking-frontend
npm install
npm run dev
```

### Backend
```bash
cd backend/creator-ranking-backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

Frontend `.env`:
```
VITE_API_URL=http://localhost:8000
```

## Deployment

- Frontend: Static hosting (Vercel, Netlify, etc.)
- Backend: Python hosting (Render, Fly.io, etc.)
