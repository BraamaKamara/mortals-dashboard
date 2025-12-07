# 🚀 Deploy to Vercel - Step 3 & 4

Your code is now on GitHub! Time to deploy to Vercel.

## Backend Deployment (Step 3)

### 3.1 Go to Vercel
1. Visit https://vercel.com/new
2. Click **Import Git Repository**
3. Paste: `https://github.com/BraamaKamara/mortals-backend.git`
4. Click **Continue**

### 3.2 Configure Project

After importing, you'll see a configuration page:
- **Project Name:** `mortals-backend`
- **Framework:** Leave blank (Other / Node.js)
- **Root Directory:** Leave blank
- **Build Command:** Leave blank
- **Output Directory:** Leave blank

Click **Deploy** (it will deploy first, then we'll add env vars)

### 3.3 Add Environment Variables

While deploying (or immediately after):
1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```
DATABASE_URL = postgresql://neondb_owner:npg_9KkAdg2iqPWX@ep-icy-forest-ag58pqfa-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NODE_ENV = production

JWT_SECRET = 174acf4ea50eebe4d1f1aa6759ce621c0223061591a6b66663194a4b7ff6d544

EMAIL_SERVICE = gmail

EMAIL_USER = your-email@gmail.com

EMAIL_PASSWORD = [your Gmail app password]

STRIPE_SECRET_KEY = sk_test_... (get from https://dashboard.stripe.com/test/apikeys)

STRIPE_WEBHOOK_SECRET = whsec_... (from https://dashboard.stripe.com/test/webhooks)

STRIPE_PRICE_PRO = price_... (create/get from https://dashboard.stripe.com/test/products)

FRONTEND_URL = http://localhost:3000 (temporary - will update after frontend deploy)

CLIENT_URL = http://localhost:3000 (temporary - will update after frontend deploy)

STRIPE_SUCCESS_URL = http://localhost:3000/?upgrade=success

STRIPE_CANCEL_URL = http://localhost:3000/?upgrade=cancel

STRIPE_PORTAL_RETURN_URL = http://localhost:3000/
```

### 3.4 Redeploy Backend

After adding env vars:
1. Go to **Deployments** tab
2. Find the first deployment
3. Click the **...** menu on the right
4. Select **Redeploy**
5. Wait for it to complete

### 3.5 Copy Backend URL

Once deployment succeeds, copy your backend URL (e.g., `https://mortals-backend-xxxxx.vercel.app`)

Save it — you'll need it for the frontend!

---

## Frontend Deployment (Step 4)

### 4.1 Go to Vercel
1. Visit https://vercel.com/new
2. Click **Import Git Repository**
3. Paste: `https://github.com/BraamaKamara/mortals-dashboard.git`
4. Click **Continue**

### 4.2 Configure Project

- **Project Name:** `mortals-dashboard-frontend` (or similar)
- **Framework:** `Create React App`
- **Root Directory:** Leave blank
- **Build Command:** `npm run build`
- **Output Directory:** `build`

Click **Deploy**

### 4.3 Add Environment Variables

After initial deploy (or while deploying):
1. Go to your project → **Settings** → **Environment Variables**
2. Add:

```
REACT_APP_API_URL = https://mortals-backend-xxxxx.vercel.app/api

REACT_APP_SOCKET_URL = https://mortals-backend-xxxxx.vercel.app
```

(Replace `mortals-backend-xxxxx` with your actual backend project name from Step 3.5)

### 4.4 Redeploy Frontend

After adding env vars:
1. Go to **Deployments** tab
2. Find the first deployment
3. Click the **...** menu
4. Select **Redeploy**
5. Wait for completion

### 4.5 Copy Frontend URL

Once deployed, copy your frontend URL (e.g., `https://mortals-dashboard-xxxxx.vercel.app`)

Save it!

---

## Your URLs (Fill in after deployment)

Backend: `https://mortals-backend-___________.vercel.app`

Frontend: `https://mortals-dashboard-___________.vercel.app`

---

## ✅ After Both Are Deployed

Reply with your backend and frontend URLs, and I'll guide you through Step 5 (cross-linking URLs) and Step 6 (testing).

---

## Need Help?

- Vercel import issues? Make sure repos are public
- Environment variables not showing? Refresh the page
- Build fails? Check that root directory is correct
- Deploy stuck? Wait 5-10 minutes or try redeploying

Ready? Go to https://vercel.com/new and start with the backend! 🚀
