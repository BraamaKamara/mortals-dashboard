# MORTALS Dashboard - Vercel Deployment for BraamaKamara

## Your Setup Summary
- **GitHub Username:** BraamaKamara
- **Neon Connection String:** `postgres://neon:npg@localhost:5432/<database_name>`
- **Backend Repo:** https://github.com/BraamaKamara/mortals-backend
- **Frontend Repo:** https://github.com/BraamaKamara/mortals-dashboard

---

## ⚠️ IMPORTANT: Fix Your Neon Connection String

The connection string you provided looks like a **local** connection:
```
postgres://neon:npg@localhost:5432/<database_name>
```

This won't work on Vercel (Vercel can't access localhost). You need the **Neon-hosted** connection string.

### Get Your Real Neon Connection String:

1. Go to https://console.neon.tech
2. Select your "mortals-dashboard" project
3. Click **Connection string** or **Pooling connection string**
4. Select **Postgres** driver
5. Copy the full URL (looks like):
```
postgresql://neon_user:password@ep-xxxxx-pool.us-east-1.neon.tech/mortals?sslmode=require
```

**Replace `<database_name>` with the actual value from Neon.**

---

## Step 0: Create Database in Neon

Before deploying to Vercel, initialize your Neon database:

```powershell
# Set your Neon connection string
$env:DATABASE_URL = "postgresql://neon_user:password@ep-xxxxx-pool.us-east-1.neon.tech/mortals?sslmode=require"

# Run migrations (from backend directory)
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
npm install
node add-messaging.js
node add-bookmarks.js
node add-moderation.js
node add-tags.js
node add-reactions-notifications.js

echo "Database initialized!"
```

---

## Step 1: Push to GitHub

Before deploying to Vercel, your code must be on GitHub.

**See:** `GITHUB_PUSH_STEPS.md` (in your project root)

Quick summary:
1. Create `mortals-backend` repo on GitHub
2. Create `mortals-dashboard` repo on GitHub
3. Run the PowerShell commands to push both

---

## Step 2: Generate JWT Secret

You'll need this for environment variables:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and save it.

---

## Step 3: Deploy Backend to Vercel

### 3.1 Create Backend Project on Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Paste: `https://github.com/BraamaKamara/mortals-backend`
4. Click **Continue**
5. **Project Name:** `mortals-backend`
6. **Framework Preset:** Leave blank (Other)
7. **Root Directory:** Leave blank
8. Click **Deploy**

### 3.2 Add Environment Variables (CRITICAL!)

While deploying (or after), go to **Settings → Environment Variables**

Add these variables:

```
DATABASE_URL = postgresql://neon_user:password@ep-xxxxx-pool.us-east-1.neon.tech/mortals?sslmode=require

NODE_ENV = production

PORT = 3001

JWT_SECRET = [paste your generated JWT secret]

EMAIL_SERVICE = gmail

EMAIL_USER = your-email@gmail.com

EMAIL_PASSWORD = [Gmail app password - see SETUP_EMAIL.md]

STRIPE_SECRET_KEY = sk_test_... (or sk_live_... if using live)

STRIPE_WEBHOOK_SECRET = whsec_...

STRIPE_PRICE_PRO = price_...

FRONTEND_URL = [Will update after frontend deploy]

CLIENT_URL = [Will update after frontend deploy]

STRIPE_SUCCESS_URL = [Will update after frontend deploy]

STRIPE_CANCEL_URL = [Will update after frontend deploy]

STRIPE_PORTAL_RETURN_URL = [Will update after frontend deploy]
```

**For now, set FRONTEND_URL/CLIENT_URL to:** `http://localhost:3000` (temporary)

### 3.3 Redeploy Backend

After adding environment variables:
1. Go to **Deployments**
2. Click the 3-dot menu on latest deployment
3. Select **Redeploy**

### 3.4 Copy Backend URL

Once deployed, you'll see your backend URL (e.g., `https://mortals-backend-xxxxx.vercel.app`)

**Save this - you'll need it for frontend deployment!**

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Frontend Project on Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Paste: `https://github.com/BraamaKamara/mortals-dashboard`
4. Click **Continue**
5. **Project Name:** `mortals-dashboard-frontend`
6. **Framework Preset:** Create React App
7. **Build Command:** `npm run build`
8. **Output Directory:** `build`
9. **Root Directory:** Leave blank
10. Click **Deploy**

### 4.2 Add Environment Variables

While deploying (or after), go to **Settings → Environment Variables**

Add these variables:

```
REACT_APP_API_URL = https://mortals-backend-xxxxx.vercel.app/api

REACT_APP_SOCKET_URL = https://mortals-backend-xxxxx.vercel.app
```

(Replace `mortals-backend-xxxxx` with your actual backend project name)

### 4.3 Redeploy Frontend

After adding environment variables:
1. Go to **Deployments**
2. Click the 3-dot menu on latest deployment
3. Select **Redeploy**

### 4.4 Copy Frontend URL

Once deployed, you'll see your frontend URL (e.g., `https://mortals-dashboard-xxxxx.vercel.app`)

**Save this!**

---

## Step 5: Update Backend with Frontend URL

Now that frontend is deployed, update the backend:

### 5.1 Go to Backend Project on Vercel

https://vercel.com → Select `mortals-backend` project → Settings → Environment Variables

### 5.2 Update These Variables:

```
FRONTEND_URL = https://mortals-dashboard-xxxxx.vercel.app

CLIENT_URL = https://mortals-dashboard-xxxxx.vercel.app

STRIPE_SUCCESS_URL = https://mortals-dashboard-xxxxx.vercel.app/?upgrade=success

STRIPE_CANCEL_URL = https://mortals-dashboard-xxxxx.vercel.app/?upgrade=cancel

STRIPE_PORTAL_RETURN_URL = https://mortals-dashboard-xxxxx.vercel.app/
```

### 5.3 Redeploy Backend

1. Go to **Deployments**
2. Click the 3-dot menu on latest deployment
3. Select **Redeploy**

---

## Step 6: Testing

### Test Backend Health

```powershell
$backendUrl = "https://mortals-backend-xxxxx.vercel.app"
curl "$backendUrl/"
```

Expected: 200 OK (may show error page, that's OK)

### Test Frontend

```powershell
$frontendUrl = "https://mortals-dashboard-xxxxx.vercel.app"
curl "$frontendUrl/"
```

Expected: 200 OK (HTML page loads)

### Test Email Verification

```powershell
$backendUrl = "https://mortals-backend-xxxxx.vercel.app"
$body = @{
    email = "test@example.com"
} | ConvertTo-Json

curl -X POST "$backendUrl/api/auth/verify" `
  -H "Content-Type: application/json" `
  -Body $body
```

Expected: 200 OK with verification code in response

---

## Troubleshooting

### Backend showing "Service Unavailable"
- ✅ Check environment variables are set
- ✅ Check DATABASE_URL is correct (Neon URL, not localhost)
- ✅ Redeploy after adding env vars

### Frontend showing API errors
- ✅ Check REACT_APP_API_URL matches backend URL
- ✅ Verify backend is responding (curl test)
- ✅ Redeploy frontend after env var changes

### Email not sending
- ✅ Verify EMAIL_USER and EMAIL_PASSWORD in backend
- ✅ Check Gmail app password is correct (16 chars)
- ✅ Enable 2FA on Gmail account

### CORS errors
- ✅ Verify FRONTEND_URL/CLIENT_URL in backend
- ✅ Make sure no trailing slashes
- ✅ Redeploy backend

---

## Your URLs (Fill in after deployment)

**Backend:** https://mortals-backend-___________.vercel.app

**Frontend:** https://mortals-dashboard-___________.vercel.app

**Neon Database:** postgres://neon_user:***@ep-xxxxx-pool.us-east-1.neon.tech/mortals

---

## Next Steps

1. ✅ Get real Neon connection string
2. ✅ Initialize database with migrations
3. ✅ Follow Step 1: Push to GitHub
4. ✅ Follow Step 2-5: Deploy to Vercel
5. ✅ Step 6: Test everything

**Estimated time: 30 minutes**

Ready? 🚀
