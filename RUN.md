# MORTALS Dashboard - Quick Start Commands

## 🚀 Running Both Services

You need **TWO separate terminals** - one for backend, one for frontend.

---

## Terminal 1: Backend (Email Verification Service)

### Option A: PowerShell

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
npm run dev
```

**If PowerShell blocks npm scripts, use:**

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

### Option B: Command Prompt (CMD)

```cmd
cd /d "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
npm run dev
```

**Expected output:**
```
🔐 MORTALS Email Verification Service
📧 Server running on http://localhost:3001
✉️  Email service: gmail
👤 Email user: ibrahimkamara930@gmail.com
⏳ Ready to verify mortal email addresses...
[Email] Transport verified and ready to send.
```

✅ **Backend is now running on:** http://localhost:3001

**Keep this terminal open!**

---

## Terminal 2: Frontend (React Dashboard)

### Option A: PowerShell

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
npm start
```

**If PowerShell blocks npm scripts, use:**

```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
& 'C:\Program Files\nodejs\npm.cmd' start
```

### Option B: Command Prompt (CMD)

```cmd
cd /d "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view mortals-dashboard in the browser.
  Local:            http://localhost:3002
```

✅ **Frontend is now running on:** http://localhost:3002

**Keep this terminal open!**

---

## 🌐 Access the Application

**Open your browser and go to:** http://localhost:3002

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Dashboard) | 3002 | http://localhost:3002 |
| Backend (Email API) | 3001 | http://localhost:3001 |
| Health Check | 3001 | http://localhost:3001/api/health |
| Debug Config (dev) | 3001 | http://localhost:3001/api/debug-config |

---

## 🔧 Troubleshooting

### Port Already in Use

#### Backend (port 3001)

**PowerShell:**
```powershell
# Find the process using port 3001
Get-NetTCPConnection -LocalPort 3001 -State Listen | Select-Object OwningProcess

# Kill the process (replace <PID> with the number shown)
Stop-Process -Id <PID> -Force
```

**CMD:**
```cmd
# Find the process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with the number in the last column)
taskkill /PID <PID> /F
```

#### Frontend (port 3002)

**PowerShell:**
```powershell
# Find the process using port 3002
Get-NetTCPConnection -LocalPort 3002 -State Listen | Select-Object OwningProcess

# Kill the process (replace <PID> with the number shown)
Stop-Process -Id <PID> -Force
```

**CMD:**
```cmd
# Find the process using port 3002
netstat -ano | findstr :3002

# Kill the process (replace <PID> with the number in the last column)
taskkill /PID <PID> /F
```

---

## 📝 Step-by-Step Guide

### Complete Startup Process

**Step 1:** Open **first terminal** (PowerShell or CMD)

**Step 2:** Start the backend:

**PowerShell:**
```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
npm run dev
```

**CMD:**
```cmd
cd /d "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
npm run dev
```

**Step 3:** Wait for "[Email] Transport verified and ready to send."

**Step 4:** Open **second terminal** (PowerShell or CMD)

**Step 5:** Start the frontend:

**PowerShell:**
```powershell
cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
npm start
```

**CMD:**
```cmd
cd /d "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
npm start
```

**Step 6:** Wait for "Compiled successfully!"

**Step 7:** Open browser to http://localhost:3002

**Step 8:** Create account and enjoy! 🎉

---

## 🛑 Stopping the Services

Press **Ctrl+C** in each terminal window to stop the services.

---

## Notes

- Backend must be running for email verification to work
- Frontend runs independently but needs backend for account creation
- Guest mode works without backend
- All email credentials are in `server/.env` (keep this file private)
- Frontend configuration is in `.env` at project root
