# MORTALS Dashboard - Email Verification Setup Guide

This guide will help you set up the email verification system for your MORTALS Dashboard.

## 📋 Overview

The email verification system consists of:
- **Backend Server**: Node.js/Express API that sends verification emails
- **Frontend Integration**: React components for email verification flow
- **Email Service**: Gmail (or other SMTP service) for sending emails

## 🚀 Quick Setup (5 minutes)

### Step 1: Setup Backend Server

1. **Navigate to server folder**:
   ```bash
   cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard\server"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure email credentials**:
   ```bash
   copy .env.example .env
   ```

4. **Edit `.env` file** with your email settings:
   - For Gmail users, see Gmail Setup section below
   - Replace `your-email@gmail.com` with your actual email
   - Replace `your-app-password` with your app-specific password

5. **Start the server**:
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3001`

### Step 2: Configure Frontend

1. **Navigate to main project folder**:
   ```bash
   cd "c:\Users\ibrahim\Downloads\Python Learning\mortals-dashboard"
   ```

2. **Copy environment template**:
   ```bash
   copy .env.example .env
   ```

3. **Verify `.env` contains**:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Start the frontend** (if not already running):
   ```bash
   npm start
   ```

## 📧 Gmail Setup (Recommended)

Gmail requires App Passwords for third-party applications:

### 1. Enable 2-Factor Authentication
- Go to: https://myaccount.google.com/security
- Enable "2-Step Verification"
- Follow the setup wizard

### 2. Generate App Password
- Go to: https://myaccount.google.com/apppasswords
- Select "App": Choose "Mail"
- Select "Device": Choose "Windows Computer" or "Other"
- Click "Generate"
- Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### 3. Update `.env` file in `server` folder:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Important**: Use the App Password, NOT your regular Gmail password!

## 🔧 Testing the System

### Test 1: Backend Health Check
Open browser: http://localhost:3001/api/health

Should see:
```json
{
  "status": "ok",
  "message": "MORTALS Email Verification Service"
}
```

### Test 2: Create Account with Email Verification
1. Open MORTALS Dashboard: http://localhost:3000
2. Click "Begin Your Journey" (or "Create Account")
3. Fill in:
   - Username: Your name
   - Email: Your actual email address
   - Age confirmation: Check the box
   - Passphrase: At least 8 characters
   - Confirm passphrase
4. Click "Create Account"
5. Check your email for the 6-digit PIN
6. Enter the PIN in the verification screen
7. Success! Account created with verified email

## 🛠️ Alternative Email Services

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=youremail@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=youremail@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Custom SMTP
```env
EMAIL_SERVICE=
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
EMAIL_USER=youremail@yourdomain.com
EMAIL_PASSWORD=your-password
```

## 🎯 Features

### Email Verification Flow
1. User enters username, email, and passphrase
2. System sends 6-digit PIN to email
3. User enters PIN within 10 minutes
4. Email verified → Account created
5. Account marked as verified in localStorage

### Security Features
- ✅ PINs expire after 10 minutes
- ✅ Maximum 5 verification attempts
- ✅ Rate limiting (1 code per minute)
- ✅ Automatic cleanup of expired codes
- ✅ Fallback to local-only mode if backend unavailable

### Fallback Mode
If the backend is unavailable:
- System automatically falls back to local-only mode
- Account created without email verification
- Dashboard still fully functional
- Message displayed: "Using local-only mode"

## 🐛 Troubleshooting

### "Could not connect to verification service"
**Cause**: Backend server not running
**Solution**: 
```bash
cd server
npm start
```

### "Invalid login" or "Authentication failed"
**Cause**: Wrong email credentials
**Solution**:
- For Gmail: Use App Password (not regular password)
- Enable 2FA first
- Generate new App Password
- Update `.env` file

### "Connection timeout"
**Cause**: Firewall or network issue
**Solution**:
- Check internet connection
- Disable firewall temporarily
- Try different email service

### Emails going to spam
**Solution**:
- Mark first email as "Not Spam"
- Add sender to contacts
- Check email service reputation

### PIN expired
**Solution**:
- Click "Resend Code" button
- New PIN valid for 10 minutes
- Check email immediately

## 📁 Project Structure

```
mortals-dashboard/
├── server/                    # Backend API
│   ├── index.js              # Express server
│   ├── package.json          # Dependencies
│   ├── .env.example          # Environment template
│   └── README.md             # Server documentation
├── src/
│   └── components/
│       └── AuthGate.jsx      # Email verification UI
├── .env.example              # Frontend environment template
└── SETUP_EMAIL.md           # This file
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use App Passwords**, not regular passwords
3. **Enable 2FA** on your email account
4. **Keep credentials secure**
5. **Use HTTPS in production**
6. **Rotate passwords regularly**

## 📊 Monitoring

### Backend Logs
Server shows:
- Email sent confirmations
- PIN codes (development mode only)
- Error messages
- Connection status

### Frontend Behavior
- Success: Green message + redirect to dashboard
- Error: Red message with specific error
- Timeout: Automatic fallback to local-only mode

## 🚀 Production Deployment

For production:

1. **Update backend URL** in frontend `.env`:
   ```
   REACT_APP_API_URL=https://your-api-domain.com/api
   ```

2. **Deploy backend** to:
   - Heroku
   - AWS Lambda
   - Vercel Functions
   - Your own server

3. **Environment variables**:
   - Set all `.env` variables on server
   - Use production email credentials
   - Enable rate limiting
   - Add logging service

4. **Security**:
   - Enable HTTPS
   - Add rate limiting
   - Implement IP blocking
   - Monitor for abuse

## 💡 Tips

- **Test with your own email** first
- **Check spam folder** if PIN doesn't arrive
- **Use Gmail** for easiest setup
- **Keep backend running** while using dashboard
- **Backend can run on different port** (update `.env`)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs in terminal
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

**Ready to use your mortality awareness dashboard with verified email accounts! ⏳**
