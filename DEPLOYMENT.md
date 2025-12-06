# Mortals Dashboard - Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier)
- PostgreSQL database (we'll use Neon.tech free tier)

## Step 1: Prepare Database (Neon.tech)

1. Go to https://neon.tech and sign up (free)
2. Create a new project: "mortals-dashboard"
3. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)
4. Run your migrations to create tables:
   ```bash
   # Update connection string in server/db.js temporarily
   # Then run:
   node server/add-messaging.js
   node server/add-bookmarks.js
   node server/add-moderation.js
   ```

## Step 2: Deploy Backend (Vercel)

1. **Push to GitHub:**
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin https://github.com/YOUR_USERNAME/mortals-backend.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your backend repository
   - Set Root Directory to `server`
   - Add Environment Variables:
     * `DATABASE_URL` = your Neon.tech connection string
     * `JWT_SECRET` = generate random string (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
     * `EMAIL_SERVICE` = gmail
     * `EMAIL_USER` = your Gmail
     * `EMAIL_PASS` = your Gmail app password
     * `FRONTEND_URL` = https://your-app.vercel.app (update after frontend deploy)
     * `NODE_ENV` = production
   - Click "Deploy"
   - Copy the deployment URL (e.g., `https://mortals-backend.vercel.app`)

## Step 3: Update Backend CORS

After deploying frontend (Step 4), update `server/index.js` CORS configuration:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
```

## Step 4: Deploy Frontend (Vercel)

1. **Update API URL in code:**
   Edit `src/App.js` and find the API_URL constant:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
   ```

2. **Create `.env.production` file** (already created):
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   REACT_APP_WS_URL=wss://your-backend-url.vercel.app
   ```

3. **Push to GitHub:**
   ```bash
   cd ..  # back to root directory
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin https://github.com/YOUR_USERNAME/mortals-dashboard.git
   git push -u origin main
   ```

4. **Deploy on Vercel:**
   - Import your frontend repository
   - Framework Preset: Create React App
   - Root Directory: (leave as root)
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variables:
     * `REACT_APP_API_URL` = your backend URL from Step 2
     * `REACT_APP_WS_URL` = your backend URL (wss://)
   - Click "Deploy"

## Step 5: Update Backend with Frontend URL

1. Go to your backend project on Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL` with your deployed frontend URL
4. Redeploy the backend

## Step 6: Test PWA Installation

1. Open your deployed app on mobile (Chrome/Edge)
2. Look for "Install app" or "Add to Home Screen"
3. Install and test!

## Alternative: Railway (Backend Alternative)

Railway offers better WebSocket support than Vercel for real-time features.

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select backend repo
4. Add environment variables (same as Vercel)
5. Deploy

Railway provides a permanent domain like: `mortals-backend.up.railway.app`

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches exact frontend URL
- Check CORS configuration in `server/index.js`

### Database Connection
- Verify `DATABASE_URL` is correct
- Ensure Neon.tech database is active
- Check SSL requirements (Neon requires SSL)

### WebSocket Issues
- Vercel has limited WebSocket support (disconnects after 60s)
- Consider Railway or Render.com for backend if WebSocket issues persist
- Update WS URL to use `wss://` protocol

### Service Worker Not Registering
- PWA requires HTTPS (Vercel provides this automatically)
- Check browser console for service worker errors
- Clear cache and reload

## Production Checklist

- [ ] Database created and tables migrated
- [ ] Backend deployed with all environment variables
- [ ] Frontend deployed with correct API URLs
- [ ] CORS configured properly
- [ ] Test login/signup
- [ ] Test direct messaging
- [ ] Test bookmarks
- [ ] Test moderation features
- [ ] Test PWA installation on mobile
- [ ] Create admin user in production database

## Creating Admin User in Production

Connect to your production database and run:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@gmail.com';
```

Or create a script:
```bash
node server/make-admin.js
```

## Monitoring

- Vercel Dashboard: Check logs and analytics
- Database: Monitor connections in Neon.tech dashboard
- Errors: Check browser console and Vercel function logs

## Cost Estimate

All services used are **FREE** for personal projects:
- Vercel: Free tier (100GB bandwidth, 6000 build minutes/month)
- Neon.tech: Free tier (1 project, 10GB storage)
- GitHub: Free for public repositories

## Next Steps After Deployment

1. Share your app URL with users
2. Monitor usage and errors
3. Consider custom domain (optional)
4. Set up continuous deployment (auto-deploy on git push)
5. Implement error tracking (Sentry, LogRocket)
