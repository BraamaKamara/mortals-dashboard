# MORTALS Dashboard - Production Deployment Checklist

## Pre-Deployment (Prep Work)

### Accounts Setup
- [ ] GitHub account created and logged in
- [ ] Vercel account created (free tier) at https://vercel.com
- [ ] Neon.tech account created at https://neon.tech
- [ ] Stripe account created at https://stripe.com (optional for payments)
- [ ] Gmail account with 2FA enabled

### Generate Secrets
- [ ] JWT Secret generated: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  ```
  [Paste here: ________________________________]
  ```

### GitHub Repositories
- [ ] GitHub repo "mortals-backend" created
- [ ] GitHub repo "mortals-dashboard" created
- [ ] Local git initialized in both directories

---

## Phase 1: Database Setup

### Neon.tech PostgreSQL
- [ ] Logged into https://neon.tech
- [ ] New project created: "mortals-dashboard"
- [ ] Database URL copied (format: `postgresql://user:pass@host/dbname`)
  ```
  DATABASE_URL: _________________________________
  ```
- [ ] Test connection successful

### Initialize Schema
- [ ] Migration scripts run locally (if needed):
  ```bash
  export DATABASE_URL="your-url"
  node server/add-messaging.js
  node server/add-bookmarks.js
  node server/add-moderation.js
  node server/add-tags.js
  ```

---

## Phase 2: Backend Deployment

### Prepare Backend
- [ ] `server/.env.production` reviewed
- [ ] `server/vercel.json` exists and is correct
- [ ] No hardcoded URLs remain (all use env vars)
- [ ] Dependencies installed: `cd server && npm install`

### Push Backend to GitHub
- [ ] Backend code pushed to `mortals-backend` repo
  ```bash
  cd server
  git init
  git add .
  git commit -m "Initial backend commit"
  git remote add origin https://github.com/YOUR_USER/mortals-backend.git
  git push -u origin main
  ```

### Deploy Backend to Vercel
- [ ] Vercel project created: "mortals-backend"
- [ ] GitHub repo imported
- [ ] Environment variables configured:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | postgresql://... |
| `NODE_ENV` | production |
| `JWT_SECRET` | [Generated secret] |
| `EMAIL_SERVICE` | gmail |
| `EMAIL_USER` | your-email@gmail.com |
| `EMAIL_PASSWORD` | [Gmail app password] |
| `STRIPE_SECRET_KEY` | sk_live_... |
| `STRIPE_WEBHOOK_SECRET` | whsec_... |
| `STRIPE_PRICE_PRO` | price_... |
| `FRONTEND_URL` | [Will update later] |
| `CLIENT_URL` | [Will update later] |

- [ ] Backend deployment successful
- [ ] Backend URL copied: `https://mortals-backend-xxxxx.vercel.app`
  ```
  Backend URL: _________________________________
  ```
- [ ] Health check passed: `curl https://backend-url.vercel.app/`

---

## Phase 3: Frontend Deployment

### Prepare Frontend
- [ ] `.env.production` created with backend URL:
  ```
  REACT_APP_API_URL=https://backend-url.vercel.app/api
  REACT_APP_SOCKET_URL=https://backend-url.vercel.app
  ```
- [ ] API URLs updated to use environment variables ✅
- [ ] Build test successful: `npm run build`

### Push Frontend to GitHub
- [ ] Frontend code pushed to `mortals-dashboard` repo
  ```bash
  git init
  git add .
  git commit -m "Initial frontend commit"
  git remote add origin https://github.com/YOUR_USER/mortals-dashboard.git
  git push -u origin main
  ```

### Deploy Frontend to Vercel
- [ ] Vercel project created: "mortals-dashboard-frontend"
- [ ] GitHub repo imported
- [ ] Build settings configured:
  - Framework: "Create React App"
  - Build Command: `npm run build`
  - Output Directory: `build`
  - Root Directory: (empty/current)
- [ ] Environment variables set:
  - `REACT_APP_API_URL` = `https://backend-url.vercel.app/api`
  - `REACT_APP_SOCKET_URL` = `https://backend-url.vercel.app`
- [ ] Frontend deployment successful
- [ ] Frontend URL copied: `https://mortals-dashboard-xxxxx.vercel.app`
  ```
  Frontend URL: _________________________________
  ```

---

## Phase 4: Finalization

### Update Backend with Frontend URL
- [ ] Vercel backend project → Settings → Environment Variables
- [ ] Updated variables:
  - `FRONTEND_URL` = `https://mortals-dashboard-xxxxx.vercel.app`
  - `CLIENT_URL` = `https://mortals-dashboard-xxxxx.vercel.app`
  - `STRIPE_SUCCESS_URL` = `https://mortals-dashboard-xxxxx.vercel.app/?upgrade=success`
  - `STRIPE_CANCEL_URL` = `https://mortals-dashboard-xxxxx.vercel.app/?upgrade=cancel`
  - `STRIPE_PORTAL_RETURN_URL` = `https://mortals-dashboard-xxxxx.vercel.app/`
- [ ] Backend redeployed

### Email Configuration
- [ ] Gmail app password generated
  - 2FA enabled on Gmail
  - https://myaccount.google.com/apppasswords
  - Credentials stored securely
- [ ] Email variable updated in Vercel backend
- [ ] Test email sent successfully

### Stripe Configuration (if using payments)
- [ ] Stripe Live mode activated
- [ ] Webhook endpoint created: `https://backend-url.vercel.app/api/billing/webhook`
- [ ] Webhook signing secret copied to backend env
- [ ] Stripe events configured (charge.succeeded, subscription updates, etc.)
- [ ] Test payment verified

---

## Testing

### Functionality Tests
- [ ] Frontend loads at `https://mortals-dashboard-xxxxx.vercel.app`
- [ ] Login/Email verification works
- [ ] Backend API responds: `curl https://backend-url.vercel.app/api/auth/verify`
- [ ] Messages send successfully
- [ ] Database queries work
- [ ] WebSockets connect properly
- [ ] Email delivery works
- [ ] Premium features (if applicable)

### Security Tests
- [ ] No hardcoded secrets in code
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Environment variables secure
- [ ] Git repos have no .env files

### Performance Tests
- [ ] Frontend load time acceptable
- [ ] Backend response time < 500ms
- [ ] Database queries optimized
- [ ] No console errors

---

## Post-Deployment

### Documentation
- [ ] URL documented in team wiki/notes
- [ ] Login credentials stored securely
- [ ] Environment variables backed up securely
- [ ] Deployment process documented

### Monitoring Setup
- [ ] Vercel analytics enabled
- [ ] Error tracking configured (Sentry recommended)
- [ ] Database backups scheduled (Neon handles this)
- [ ] Alert notifications set up

### Domain Setup (Optional)
- [ ] Custom domain purchased (Namecheap, GoDaddy, etc.)
- [ ] Domain connected to Vercel
- [ ] SSL certificate auto-generated
- [ ] DNS records configured

---

## Rollback Plan

- [ ] Can revert to previous deployment on Vercel
- [ ] Database backup procedure known
- [ ] Local development still works
- [ ] Git history preserved for rollback

---

## Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| CORS errors | Update FRONTEND_URL/CLIENT_URL in backend env |
| Email not sending | Verify Gmail credentials and 2FA status |
| Database connection fails | Check Neon URL and IP whitelist |
| API URL 404 errors | Verify REACT_APP_API_URL in frontend |
| Webhooks not working | Check Stripe signing secret |
| Build fails | Run `npm run build` locally to debug |

---

## Sign-Off

- Deployer Name: ___________________________
- Date: ___________________________
- Backend URL: ___________________________
- Frontend URL: ___________________________
- Notes: ___________________________________________________

