# Keep Render Server Awake

This script pings your Render server every 14 minutes to prevent it from sleeping on the free tier.

## Setup with cron-job.org (Free):

1. Go to [cron-job.org](https://cron-job.org)
2. Sign up for free account
3. Create new cron job:
   - **Title**: Keep Chess Server Awake
   - **URL**: `https://chess-server-o1fu.onrender.com/health`
   - **Schedule**: Every 14 minutes (*/14 * * * *)
   - **Enabled**: Yes
4. Save

## Setup with UptimeRobot (Free - Alternative):

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Add New Monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Chess Server
   - **URL**: `https://chess-server-o1fu.onrender.com/health`
   - **Monitoring Interval**: 5 minutes (max on free tier)
4. Create Monitor

## Note:
Render free tier spins down after 15 minutes of inactivity. These services will ping your server regularly to keep it awake. However, if the server does sleep, the improved reconnection logic will automatically reconnect clients when it wakes up (takes ~30 seconds).
