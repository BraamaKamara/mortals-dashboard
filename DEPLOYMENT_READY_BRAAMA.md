# 🎉 MORTALS Dashboard - Ready for GitHub & Vercel Deployment

## ✅ Status: Database Ready!

Your Neon database has been successfully initialized with all required tables:
- ✅ Users, Sessions, Subscriptions
- ✅ Posts, Comments, Reactions
- ✅ Messaging (Conversations, Messages)
- ✅ Bookmarks
- ✅ Moderation (Reports, Blocks, Hidden)
- ✅ Notifications
- ✅ Tags

**Database:** `postgresql://neondb_owner:***@ep-icy-forest-ag58pqfa.c-2.eu-central-1.aws.neon.tech/neondb`

---

## 🔑 Your Credentials (KEEP SECURE!)

### Neon Database Connection Strings

**For Development (LOCAL) - DO NOT USE POOLER:**
```
postgresql://neondb_owner:npg_9KkAdg2iqPWX@ep-icy-forest-ag58pqfa.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**For Production (Vercel) - USE THIS ONE:**
```
postgresql://neondb_owner:npg_9KkAdg2iqPWX@ep-icy-forest-ag58pqfa-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

⚠️ **IMPORTANT:** 
- Keep these strings secret - they contain your database password
- Use the "direct" version for local work
- Use the "pooler" version for Vercel (handles connection pooling better)
- Never commit to Git or share publicly

---

## 📋 Deployment Checklist

### Before Starting
- [ ] GitHub account ready
- [ ] JWT Secret generated (you'll generate this in next step)
- [ ] Gmail account with 2FA enabled (for email verification)
- [ ] Optional: Stripe account for premium features

---

## Step 1: Generate JWT Secret

Run this command to generate a secure JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output. You'll need it for Vercel environment variables.

---

## Step 2: Push Code to GitHub

### 2.1 Create Two GitHub Repositories

Go to https://github.com/new and create:

**Repo 1 - Backend:**
- Name: `mortals-backend`
- Description: Email verification backend for MORTALS Dashboard
- Public
- DO NOT initialize with README

**Repo 2 - Frontend:**
- Name: `mortals-dashboard`
- Description: MORTALS Dashboard - Mortality awareness platform
- Public
- DO NOT initialize with README

### 2.2 Push Backend

Run in PowerShell:

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
git remote set-url origin https://github.com/BraamaKamara/mortals-backend.git
git branch -M main
git push -u origin main
```

You'll be prompted for authentication:
- **Username:** Your GitHub username
- **Password:** Your GitHub Personal Access Token (NOT your password!)
  - Get one at: https://github.com/settings/tokens/new
  - Scopes: `repo` and `write:packages`
  - Click "Generate token" and copy it

### 2.3 Push Frontend

Run in PowerShell:

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
git init
git add .
git commit -m "Initial frontend commit - MORTALS Dashboard"
git remote add origin https://github.com/BraamaKamara/mortals-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Vercel

### 3.1 Create Backend Project

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Paste: `https://github.com/BraamaKamara/mortals-backend.git`
4. Click **Continue**

### 3.2 Configure Project

- **Project Name:** `mortals-backend`
- **Framework:** Leave blank (Other)
- **Root Directory:** Leave blank
- Click **Deploy** (it will fail without env vars, that's OK)

### 3.3 Add Environment Variables

While it's deploying, go to **Settings → Environment Variables** and add:

```
DATABASE_URL = postgresql://neondb_owner:npg_9KkAdg2iqPWX@ep-icy-forest-ag58pqfa-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NODE_ENV = production

JWT_SECRET = [paste your generated secret]

EMAIL_SERVICE = gmail

EMAIL_USER = your-email@gmail.com

EMAIL_PASSWORD = [Gmail app password - see note below]

STRIPE_SECRET_KEY = sk_test_... (get from https://dashboard.stripe.com/test/apikeys)

STRIPE_WEBHOOK_SECRET = whsec_... (get from https://dashboard.stripe.com/test/webhooks)

STRIPE_PRICE_PRO = price_... (get from https://dashboard.stripe.com/test/products)

FRONTEND_URL = http://localhost:3000 (temporary)

CLIENT_URL = http://localhost:3000 (temporary)

STRIPE_SUCCESS_URL = http://localhost:3000/?upgrade=success

STRIPE_CANCEL_URL = http://localhost:3000/?upgrade=cancel

STRIPE_PORTAL_RETURN_URL = http://localhost:3000/
```

### 3.4 Redeploy

After adding env vars:
1. Go to **Deployments**
2. Find the first failed deployment
3. Click 3-dot menu → **Redeploy**

### 3.5 Get Backend URL

Once deployed successfully, copy your backend URL:
```
https://mortals-backend-xxxxx.vercel.app
```

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Frontend Project

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Paste: `https://github.com/BraamaKamara/mortals-dashboard.git`
4. Click **Continue**

### 4.2 Configure Project

- **Project Name:** `mortals-dashboard-frontend`
- **Framework:** Create React App
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Root Directory:** Leave blank
- Click **Deploy**

### 4.3 Add Environment Variables

Go to **Settings → Environment Variables** and add:

```
REACT_APP_API_URL = https://mortals-backend-xxxxx.vercel.app/api

REACT_APP_SOCKET_URL = https://mortals-backend-xxxxx.vercel.app
```

(Replace `mortals-backend-xxxxx` with your actual backend project name)

### 4.4 Redeploy

After adding env vars:
1. Go to **Deployments**
2. Find the first deployment
3. Click 3-dot menu → **Redeploy**

### 4.5 Get Frontend URL

Once deployed, copy your frontend URL:
```
https://mortals-dashboard-xxxxx.vercel.app
```

---

## Step 5: Update Backend URLs

Now that frontend is live, update the backend:

1. Go to backend project on Vercel
2. Settings → Environment Variables
3. Update these:

```
FRONTEND_URL = https://mortals-dashboard-xxxxx.vercel.app

CLIENT_URL = https://mortals-dashboard-xxxxx.vercel.app

STRIPE_SUCCESS_URL = https://mortals-dashboard-xxxxx.vercel.app/?upgrade=success

STRIPE_CANCEL_URL = https://mortals-dashboard-xxxxx.vercel.app/?upgrade=cancel

STRIPE_PORTAL_RETURN_URL = https://mortals-dashboard-xxxxx.vercel.app/
```

4. Redeploy backend

---

## Step 6: Test Everything

### Test Backend

```powershell
curl "https://mortals-backend-xxxxx.vercel.app/" -ErrorAction SilentlyContinue
```

Expected: 200 OK

### Test Frontend

Visit: `https://mortals-dashboard-xxxxx.vercel.app`

Expected: App loads in browser

### Test Email Verification

```powershell
$backend = "https://mortals-backend-xxxxx.vercel.app"
$body = @{email="test@example.com"} | ConvertTo-Json

curl -X POST "$backend/api/auth/verify" `
  -H "Content-Type: application/json" `
  -Body $body
```

Expected: 200 OK with verification code

---

## 📧 Gmail Setup (For Email Verification)

1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
   - Select: Mail
   - Select: Windows Computer
   - Copy the 16-character password
3. Use that password as `EMAIL_PASSWORD` in Vercel env vars

---

## 🚀 Your Production URLs (Save These!)

**Backend:** https://mortals-backend-___________.vercel.app

**Frontend:** https://mortals-dashboard-___________.vercel.app

**Database:** Neon.tech (EU Central)

**GitHub:** https://github.com/BraamaKamara/mortals-backend & mortals-dashboard

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Verify FRONTEND_URL/CLIENT_URL match exactly |
| Email not sending | Check EMAIL_PASSWORD is Gmail app password (16 chars) |
| API 404 errors | Check REACT_APP_API_URL ends with `/api` |
| Database timeout | Use pooler connection for Vercel |
| Build fails | Run `npm run build` locally to debug |

---

## Next: Ready to Deploy?

1. ✅ Generate JWT Secret
2. ✅ Create GitHub repos
3. ✅ Push code (follow Step 2)
4. ✅ Deploy Backend (follow Step 3)
5. ✅ Deploy Frontend (follow Step 4)
6. ✅ Cross-link URLs (Step 5)
7. ✅ Test (Step 6)

**Estimated time: 20-30 minutes**

Let me know when you're ready to start! 🎉
