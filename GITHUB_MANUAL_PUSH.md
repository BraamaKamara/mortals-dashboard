# GitHub Push - Manual Steps

## ⚠️ ACTION REQUIRED: Create 2 GitHub Repositories

### Step 1: Create Backend Repository

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name:** `mortals-backend`
   - **Description:** Email verification backend for MORTALS Dashboard
   - **Visibility:** Public
   - **Initialize with README:** NO (leave unchecked!)
3. Click **Create repository**
4. You'll see a page with push instructions - just close it

### Step 2: Create Frontend Repository

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name:** `mortals-dashboard`
   - **Description:** MORTALS Dashboard - Mortality awareness platform
   - **Visibility:** Public
   - **Initialize with README:** NO (leave unchecked!)
3. Click **Create repository**
4. You'll see a page with push instructions - just close it

---

## After Creating Repos: Push Code

Once BOTH repos are created, run these commands:

### Push Backend

Copy and paste this entire block into PowerShell:

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
git push -u origin main
```

You'll be prompted for authentication. Enter:
- **Username:** `BraamaKamara`
- **Password:** Your GitHub Personal Access Token (NOT your regular password!)

To get a token:
1. Go to: https://github.com/settings/tokens/new
2. Set **Expiration:** 90 days
3. Check **repo** scope
4. Click **Generate token**
5. Copy the token (you won't see it again!)
6. Paste when prompted

### Push Frontend

After backend pushes successfully, run:

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
git add .
git commit -m "Initial commit - MORTALS Dashboard frontend"
git remote add origin https://github.com/BraamaKamara/mortals-dashboard.git
git branch -M main
git push -u origin main
```

Again paste your Personal Access Token when prompted.

---

## Troubleshooting

**"Repository not found"**
- Make sure repos are created at https://github.com/new
- Make sure they're PUBLIC
- Make sure username is `BraamaKamara`

**"Authentication failed"**
- Use Personal Access Token, NOT your GitHub password
- Get token at: https://github.com/settings/tokens/new
- Make sure `repo` scope is checked

**"Already exists"**
- You already have both repos created ✅
- Just proceed with pushing code

---

## Ready?

1. Create both repos at https://github.com/new
2. Run the PowerShell commands above
3. Reply with: "Repos created and pushed!" when done

I'll help you with the next step! 🚀
