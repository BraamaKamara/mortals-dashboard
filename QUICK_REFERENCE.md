# 🚀 MORTALS Dashboard - Deployment Quick Reference

## Files You Need

| File | Purpose |
|------|---------|
| **DEPLOYMENT_READY.md** | Start here! Overview of changes |
| **PRODUCTION_DEPLOYMENT.md** | Step-by-step deployment guide |
| **DEPLOYMENT_CHECKLIST.md** | Tracking sheet for deployment |
| **deploy.bat** | Windows setup helper |
| **deploy.sh** | Mac/Linux setup helper |
| **.env.production** | Frontend environment template |
| **server/.env.production** | Backend environment template |

## 5-Minute Quickstart

### 1. Create Accounts
- Vercel: https://vercel.com
- Neon.tech: https://neon.tech
- GitHub: https://github.com (if needed)

### 2. Create Database
- Neon.tech → New Project → Copy URL

### 3. Generate Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Push to GitHub
```bash
# Backend
cd server
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/USER/mortals-backend.git
git push -u origin main

# Frontend (from root)
cd ..
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/USER/mortals-dashboard.git
git push -u origin main
```

### 5. Deploy to Vercel
- Backend: https://vercel.com/new → Import mortals-backend
- Frontend: https://vercel.com/new → Import mortals-dashboard

## Environment Variables Needed

### Backend (Vercel)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
FRONTEND_URL=https://...
CLIENT_URL=https://...
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://backend.vercel.app/api
REACT_APP_SOCKET_URL=https://backend.vercel.app
```

## Status Check

- [x] Code ready for production
- [x] Environment variables templated
- [x] Localhost URLs removed (use env vars)
- [x] Git configured
- [x] Documentation complete
- [ ] Accounts created (your turn)
- [ ] Database created (your turn)
- [ ] Code pushed to GitHub (your turn)
- [ ] Deployed to Vercel (your turn)

## Next Action

👉 **Read: PRODUCTION_DEPLOYMENT.md**

Start at **Phase 1: Pre-Deployment Setup**

## Expected Time: 30-45 minutes

---

**Need help?**
1. Check DEPLOYMENT_CHECKLIST.md for step-by-step verification
2. Read PRODUCTION_DEPLOYMENT.md troubleshooting section
3. Run `deploy.bat` (Windows) or `./deploy.sh` (Mac/Linux)

**Your app is ready. Let's go live! 🎉**
