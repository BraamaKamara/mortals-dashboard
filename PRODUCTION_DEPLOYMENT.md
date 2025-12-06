# MORTALS Dashboard - Production Deployment Guide

## Quick Start Deployment Checklist

### Phase 1: Pre-Deployment Setup (Prep Your Accounts)

- [ ] Create Vercel account (free) at https://vercel.com
- [ ] Create Neon.tech account (free PostgreSQL) at https://neon.tech
- [ ] Create GitHub account if you don't have one at https://github.com
- [ ] Have your Stripe API keys ready (from https://dashboard.stripe.com)
- [ ] Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Phase 2: Database Setup

1. **Create Neon Database:**
   - Go to https://neon.tech and sign up
   - Create new project: "mortals-dashboard"
   - Copy the connection string (e.g., `postgresql://user:pass@host/dbname`)
   - Save this - you'll need it for environment variables

2. **Initialize Database Schema:**
   - From your local machine, run the migration scripts to set up tables:
   ```bash
   cd mortals-dashboard
   export DATABASE_URL="your-neon-connection-string"
   
   # Run each migration script
   node server/add-messaging.js
   node server/add-bookmarks.js
   node server/add-moderation.js
   node server/add-tags.js
   node server/add-reactions-notifications.js
   ```

### Phase 3: Backend Deployment (Vercel)

1. **Push Backend to GitHub:**
   ```bash
   cd mortals-dashboard/server
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin https://github.com/YOUR_USERNAME/mortals-backend.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy Backend on Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select `mortals-backend` repo
   - Project Name: `mortals-backend`
   - Framework: `Other` (Node.js)
   - Root Directory: (leave empty)
   - Build Command: `npm install` (or leave empty)
   - Output Directory: (leave empty)
   - Click "Deploy"

3. **Add Environment Variables to Vercel Backend:**
   - Go to your backend project settings → Environment Variables
   - Add these variables:
   ```
   DATABASE_URL = postgresql://user:pass@host/dbname  (from Neon)
   NODE_ENV = production
   PORT = 3001
   JWT_SECRET = (use the generated secret from Phase 1)
   EMAIL_SERVICE = gmail
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = your-gmail-app-password
   STRIPE_SECRET_KEY = sk_live_... (your Stripe LIVE key)
   STRIPE_WEBHOOK_SECRET = whsec_...
   STRIPE_PRICE_PRO = price_...
   FRONTEND_URL = (will update after frontend deploy)
   CLIENT_URL = (will update after frontend deploy)
   STRIPE_SUCCESS_URL = https://your-frontend-url.vercel.app/?upgrade=success
   STRIPE_CANCEL_URL = https://your-frontend-url.vercel.app/?upgrade=cancel
   STRIPE_PORTAL_RETURN_URL = https://your-frontend-url.vercel.app/
   ```
   - Copy the deployment URL (e.g., `https://mortals-backend.vercel.app`)

### Phase 4: Frontend Deployment (Vercel)

1. **Push Frontend to GitHub:**
   ```bash
   cd mortals-dashboard
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin https://github.com/YOUR_USERNAME/mortals-dashboard.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy Frontend on Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select `mortals-dashboard` repo
   - Project Name: `mortals-dashboard-frontend`
   - Framework: `Create React App`
   - Root Directory: (leave empty)
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Click "Deploy"

3. **Add Environment Variables to Vercel Frontend:**
   - Go to your frontend project settings → Environment Variables
   - Add these variables (replace with your backend URL):
   ```
   REACT_APP_API_URL = https://mortals-backend.vercel.app/api
   REACT_APP_SOCKET_URL = https://mortals-backend.vercel.app
   ```
   - Redeploy frontend after adding variables

4. **Copy Frontend URL for Backend:**
   - Get your frontend deployment URL (e.g., `https://mortals-dashboard-123.vercel.app`)
   - Go back to backend project settings → Environment Variables
   - Update:
     * `FRONTEND_URL` = your frontend URL
     * `CLIENT_URL` = your frontend URL
     * `STRIPE_SUCCESS_URL` = https://your-frontend-url.vercel.app/?upgrade=success
     * `STRIPE_CANCEL_URL` = https://your-frontend-url.vercel.app/?upgrade=cancel
     * `STRIPE_PORTAL_RETURN_URL` = https://your-frontend-url.vercel.app/
   - Redeploy backend after changes

### Phase 5: Configure Email (Gmail)

1. **Enable 2FA on Gmail:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password
   - Update `EMAIL_PASSWORD` in backend environment variables

3. **Test Email:**
   ```bash
   curl -X POST https://your-backend-url.vercel.app/api/auth/verify \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

### Phase 6: Configure Stripe Webhooks (Production)

1. **Get Live Webhook Signing Secret:**
   - Go to https://dashboard.stripe.com/webhooks
   - Create endpoint for `https://your-backend-url.vercel.app/api/billing/webhook`
   - Select events: `charge.succeeded`, `customer.subscription.updated`, etc.
   - Copy signing secret and update `STRIPE_WEBHOOK_SECRET`

2. **Test Webhook:**
   - Use Stripe's test mode webhooks first
   - Then switch to live mode after verification

## Post-Deployment Verification

```bash
# Test Backend Health
curl https://your-backend-url.vercel.app/

# Test Frontend
curl https://your-frontend-url.vercel.app/

# Test Email (replace with your backend URL)
curl -X POST https://your-backend-url.vercel.app/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

## Environment Variables Summary

### Backend (.env.production / Vercel)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASSWORD=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
FRONTEND_URL=https://your-app.vercel.app
CLIENT_URL=https://your-app.vercel.app
STRIPE_SUCCESS_URL=https://your-app.vercel.app/?upgrade=success
STRIPE_CANCEL_URL=https://your-app.vercel.app/?upgrade=cancel
STRIPE_PORTAL_RETURN_URL=https://your-app.vercel.app/
```

### Frontend (.env.production / Vercel)
```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
REACT_APP_SOCKET_URL=https://your-backend-url.vercel.app
```

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` and `CLIENT_URL` in backend environment variables
- Ensure URLs don't have trailing slashes
- Redeploy backend after updating

### Database Connection Issues
- Verify Neon connection string is correct
- Check that IP whitelist includes Vercel's IPs (usually allows all)
- Verify `DATABASE_URL` is set in backend environment

### Email Not Sending
- Verify Gmail app password is correct (16 characters)
- Check that 2FA is enabled on Gmail
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in environment

### Stripe Webhook Issues
- Verify webhook endpoint is correct
- Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
- Test with Stripe CLI: `stripe listen --forward-to https://your-url/api/billing/webhook`

## Scaling & Optimization

- **Database:** Neon.tech provides automatic scaling
- **Frontend:** Vercel auto-scales with edge functions
- **Backend:** Node.js on Vercel (consider upgrading to Pro for better performance)
- **Real-time:** Socket.io connections may need Vercel Pro for reliability

## Security Checklist

- [ ] All secrets in Vercel env vars (never commit)
- [ ] JWT_SECRET is strong and unique
- [ ] Database password is strong
- [ ] Email credentials are app-password, not regular password
- [ ] Stripe webhook secret is kept secure
- [ ] CORS is restricted to your domain
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Git repos are private

## Support & Documentation

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Stripe Docs: https://stripe.com/docs
- Node.js: https://nodejs.org/docs
- React: https://react.dev

