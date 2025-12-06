# 🚀 QUICK START - Email Verification Setup

## ✅ Dependencies Installed!

Backend dependencies are now installed. Follow these steps to complete setup:

---

## 📧 Step 1: Configure Your Email (5 minutes)

### Option A: Using Gmail (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select App: "Mail"
   - Select Device: "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Update server/.env file**
   - Open: `server\.env` in Notepad
   - Replace `your-email@gmail.com` with your Gmail address
   - Replace `your-app-password` with the App Password you just generated
   - Save the file

**Example:**
```
EMAIL_SERVICE=gmail
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Option B: Using Other Email Services

Edit `server\.env` and change:
```
EMAIL_SERVICE=outlook    # or yahoo, etc.
EMAIL_USER=youremail@outlook.com
EMAIL_PASSWORD=your-password
```

---

## 🎮 Step 2: Start the Backend Server

Open a terminal in the project folder and run:

```bash
cd server
npm start
```

You should see:
```
🔐 MORTALS Email Verification Service
📧 Server running on http://localhost:3001
✉️  Email service: gmail
👤 Email user: yourname@gmail.com

⏳ Ready to verify mortal email addresses...
```

**Keep this terminal open!** The backend needs to stay running.

---

## 🎯 Step 3: Start the Frontend Dashboard

Open a **NEW terminal** and run:

```bash
npm start
```

The dashboard will open at: http://localhost:3000

---

## 🧪 Step 4: Test the System

1. **Test Backend Health:**
   - Open browser: http://localhost:3001/api/health
   - Should see: `{"status":"ok","message":"MORTALS Email Verification Service"}`

2. **Create Test Account:**
   - Go to dashboard: http://localhost:3000
   - Click "Begin Your Journey"
   - Fill in your details (use your REAL email!)
   - Click "Create Account"
   - Check your email for the 6-digit PIN
   - Enter the PIN
   - Success! ✅

---

## ⚠️ Troubleshooting

### "Invalid login" or Authentication Error

**Problem:** Wrong email credentials
**Solution:**
1. Make sure you're using an **App Password**, not your regular Gmail password
2. Enable 2FA on your Google account first
3. Generate a new App Password
4. Update `server\.env` with the new password
5. Restart the backend server

### Email Not Received

**Solutions:**
- Check spam/junk folder
- Wait 1-2 minutes (delivery delay)
- Make sure backend server is running
- Check backend terminal for errors
- Verify email address is correct

### "Could not connect to verification service"

**Problem:** Backend server not running
**Solution:**
1. Open terminal in `server` folder
2. Run: `npm start`
3. Make sure you see "Server running on http://localhost:3001"
4. Try creating account again

### Port 3001 Already in Use

**Solution:**
```bash
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## 📁 Important Files

- `server\.env` - Email configuration (EDIT THIS!)
- `.env` - Frontend configuration (already set)
- `server\index.js` - Backend server code
- `src\components\AuthGate.jsx` - Email verification UI

---

## 🎉 You're All Set!

Once both terminals are running:
- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:3000
- ✅ Email verification working!

**Next Steps:**
1. Configure your email in `server\.env`
2. Start backend: `cd server && npm start`
3. Start frontend: `npm start` (in new terminal)
4. Test with your real email address!

---

## 💡 Quick Commands

**Start Backend:**
```bash
cd server
npm start
```

**Start Frontend:**
```bash
npm start
```

**Stop Server:**
Press `Ctrl + C` in the terminal

**Restart Backend:**
Press `Ctrl + C`, then run `npm start` again

---

**Need Help?**
- Check backend terminal for error messages
- Check browser console (F12) for frontend errors
- Verify email credentials in `server\.env`
- Make sure both backend and frontend are running

**Remember:** The backend must stay running while using the dashboard!

⏳ **"We are all mortal. The question is: are we awake?"**
