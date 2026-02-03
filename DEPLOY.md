# Deploy Instructions

## Backend (Socket.io Server) - Render

The backend needs to be deployed to a service that supports WebSockets. Vercel doesn't support persistent WebSocket connections.

### Deploy to Render (Free):

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (`Chess-App`)
4. Configure the service:
   - **Name**: `chess-server` (or your preference)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
5. Add environment variable:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://chessappelyesd.vercel.app`
6. Click "Create Web Service"
7. Wait for deployment (takes 2-3 minutes)
8. Copy your Render URL (e.g., `https://chess-server-xyz.onrender.com`)

### Configure Vercel Frontend:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `VITE_SOCKET_URL`
   - **Value**: `https://chess-server-xyz.onrender.com` (your Render URL)
4. Go to Deployments → Click ⋯ → Redeploy

## Frontend (Vercel)

Already deployed. Just need to add the `VITE_SOCKET_URL` environment variable pointing to your Railway/Render backend.

### Quick Setup:

```bash
# After deploying backend to Railway/Render
vercel env add VITE_SOCKET_URL production
# Paste your backend URL (e.g., https://chess-backend.railway.app)
vercel --prod
```
