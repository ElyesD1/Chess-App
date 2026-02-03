# Deploy Instructions

## Backend (Socket.io Server)

The backend needs to be deployed to a service that supports WebSockets. Vercel doesn't support persistent WebSocket connections, so use Railway:

### Deploy to Railway (Free):

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `Chess-App` repository
5. Railway will auto-detect Node.js and use `server.js`
6. After deployment, copy your Railway URL (e.g., `https://your-app.railway.app`)
7. Go to your Vercel project settings
8. Add environment variable:
   - Name: `VITE_SOCKET_URL`
   - Value: `https://your-app.railway.app` (your Railway URL)
9. Redeploy on Vercel

### Alternative: Deploy to Render (Free):

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Create Web Service
6. Copy your Render URL and add to Vercel as `VITE_SOCKET_URL`

## Frontend (Vercel)

Already deployed. Just need to add the `VITE_SOCKET_URL` environment variable pointing to your Railway/Render backend.

### Quick Setup:

```bash
# After deploying backend to Railway/Render
vercel env add VITE_SOCKET_URL production
# Paste your backend URL (e.g., https://chess-backend.railway.app)
vercel --prod
```
