# GitHub Push Instructions for BraamaKamara

## Step 1: Create GitHub Repos

Visit these links and create two **PUBLIC** repositories:

### Repository 1: Backend
- **URL:** https://github.com/new
- **Repository name:** `mortals-backend`
- **Description:** Email verification backend for MORTALS Dashboard
- **Public/Private:** Public
- **Initialize with README:** NO (leave unchecked)
- **Click:** Create repository

### Repository 2: Frontend
- **URL:** https://github.com/new
- **Repository name:** `mortals-dashboard`
- **Description:** MORTALS Dashboard - Mortality awareness platform
- **Public/Private:** Public
- **Initialize with README:** NO (leave unchecked)
- **Click:** Create repository

---

## Step 2: Push Backend to GitHub

Run these commands in **PowerShell** (copy & paste all at once):

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
git remote set-url origin https://github.com/BraamaKamara/mortals-backend.git
git branch -M main
git push -u origin main
```

When prompted for password, use your GitHub **Personal Access Token** (not your password):
- Go to: https://github.com/settings/tokens/new
- Scopes: Select `repo` and `write:packages`
- Generate token and copy it
- Paste when prompted

---

## Step 3: Push Frontend to GitHub

After backend is pushed, run in **PowerShell**:

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

## Done!

After both push successfully, you'll have:
- `https://github.com/BraamaKamara/mortals-backend`
- `https://github.com/BraamaKamara/mortals-dashboard`

Ready for Vercel deployment!
