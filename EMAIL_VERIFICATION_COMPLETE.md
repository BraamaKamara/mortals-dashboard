# 🎯 MORTALS Dashboard - Email Verification System

## ✅ Implementation Complete!

Your MORTALS Dashboard now includes a **hybrid email verification system** with these features:

### 🔐 Security Features
- ✅ Email verification with 6-digit PIN codes
- ✅ PIN expires after 10 minutes
- ✅ Maximum 5 verification attempts per code
- ✅ Rate limiting (1 code per minute)
- ✅ Automatic fallback to local-only mode if backend unavailable
- ✅ Secure passphrase hashing (SHA-256)

### 📧 Email Verification Flow
1. User creates account (username, email, passphrase, age verification)
2. System sends 6-digit PIN to user's email
3. User enters PIN within 10 minutes
4. Email verified → Account created with verified status
5. If backend unavailable → Falls back to local-only mode

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows Users:**
```bash
# Run the setup script
setup-backend.bat

# Follow the prompts to configure email settings
# Then start the backend:
start-backend.bat

# In another terminal, start the frontend:
npm start
```

### Option 2: Manual Setup

**Step 1: Backend Setup**
```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Configure email
copy .env.example .env
notepad .env

# Start backend
npm start
```

**Step 2: Frontend Setup**
```bash
# In main project folder
npm start
```

## 📧 Gmail Configuration (5 minutes)

### 1. Enable 2-Factor Authentication
- Go to: https://myaccount.google.com/security
- Click "2-Step Verification"
- Follow the setup wizard

### 2. Generate App Password
- Go to: https://myaccount.google.com/apppasswords
- App: Select "Mail"
- Device: Select "Windows Computer" or "Other"
- Click "Generate"
- Copy the 16-character password

### 3. Update server/.env:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**⚠️ Important:** Use the App Password, NOT your regular password!

## 🧪 Testing

### 1. Backend Health Check
Open: http://localhost:3001/api/health

Expected response:
```json
{
  "status": "ok",
  "message": "MORTALS Email Verification Service"
}
```

### 2. Create Test Account
1. Open dashboard: http://localhost:3000
2. Click "Begin Your Journey"
3. Fill in details with your real email
4. Click "Create Account"
5. Check email for PIN (check spam folder too!)
6. Enter PIN
7. Account created! ✅

## 📁 File Structure

```
mortals-dashboard/
├── server/                          # Backend API
│   ├── index.js                    # Express server with email service
│   ├── package.json                # Backend dependencies
│   ├── .env.example                # Email config template
│   └── README.md                   # Backend documentation
│
├── src/
│   └── components/
│       └── AuthGate.jsx            # Updated with verification UI
│
├── setup-backend.bat               # Automated setup script (Windows)
├── start-backend.bat               # Start backend server (Windows)
├── SETUP_EMAIL.md                  # Detailed setup guide
└── EMAIL_VERIFICATION_COMPLETE.md  # This file
```

## 🎨 UI Screens Added

### 1. Welcome Screen
- Login button (existing users)
- Begin Journey (new users)
- Guest Mode

### 2. Signup Screen
- Username field
- Email field (with validation)
- Passphrase + confirmation
- Age verification checkbox (18+)
- Creates account → Sends verification email

### 3. **NEW** Email Verification Screen
- 6-digit PIN input field
- Countdown timer (10 minutes)
- Remaining attempts indicator
- Resend code button
- Back button

### 4. Login Screen
- Email field
- Passphrase field
- Create Account link
- Guest Mode option

## 🔄 Verification Flow

```
┌─────────────────┐
│  Signup Form    │
│  (username,     │
│   email, pass)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send Email     │
│  (6-digit PIN)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Verify PIN     │
│  (10 min, 5x)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Success   Failed
    │         │
    ▼         ▼
Dashboard  Try Again
```

## 🛡️ Fallback Mechanism

If backend is unavailable:
```
User creates account
    ↓
Frontend tries to connect to backend
    ↓
Connection fails (timeout)
    ↓
System automatically falls back
    ↓
Account created as "unverified"
    ↓
User can still access dashboard
    ↓
Message: "Using local-only mode"
```

## 🔧 API Endpoints

### POST `/api/send-verification`
Send verification PIN to email
```json
Request:
{
  "email": "user@example.com",
  "username": "John Doe"
}

Response:
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": 600
}
```

### POST `/api/verify-pin`
Verify the PIN code
```json
Request:
{
  "email": "user@example.com",
  "pin": "123456"
}

Response:
{
  "success": true,
  "message": "Email verified successfully!",
  "verified": true
}
```

### POST `/api/resend-verification`
Resend verification code (rate limited)
```json
Request:
{
  "email": "user@example.com",
  "username": "John Doe"
}

Response:
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### GET `/api/health`
Health check endpoint
```json
Response:
{
  "status": "ok",
  "message": "MORTALS Email Verification Service"
}
```

## 🎯 localStorage Schema

After successful verification:
```javascript
{
  "mortals.auth.hash": "sha256_hash",           // Hashed passphrase
  "mortals.auth.username": "John Doe",          // User's name
  "mortals.auth.email": "user@example.com",     // Verified email
  "mortals.auth.verified": "true",              // Verification status
  "mortals.auth.created": "2025-11-04T..."      // Account creation timestamp
}
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if dependencies are installed
cd server
npm install

# Check if .env exists
dir .env

# Check if port 3001 is available
netstat -ano | findstr :3001
```

### Email not received
- Check spam/junk folder
- Verify email address is correct
- Check backend logs for errors
- Try different email service
- Wait 1-2 minutes (delivery delay)

### "Could not connect to verification service"
- Backend server not running
- Wrong API_URL in frontend .env
- Firewall blocking port 3001
- Check: http://localhost:3001/api/health

### "Invalid login" (Gmail)
- Must use App Password, not regular password
- Enable 2FA first
- Generate new App Password
- Update .env with new password

## 📊 Features Comparison

| Feature | With Verification | Without Verification |
|---------|------------------|---------------------|
| Email Validation | ✅ Real verification | ❌ No validation |
| Security | ✅ Proves ownership | ⚠️ Self-declared |
| Account Recovery | ✅ Possible (future) | ❌ Not possible |
| Multi-device | ✅ Portable | ⚠️ Device-locked |
| Server Required | ⚠️ Yes (3001) | ✅ No |
| Internet Required | ⚠️ Yes | ✅ No |
| Privacy | ⚠️ Email sent | ✅ 100% local |

## 🌟 Best Practices

1. **Use your real email** for verification
2. **Keep backend running** while using dashboard
3. **Don't share your passphrase** (cannot be recovered)
4. **Check email immediately** after signup (10-min expiry)
5. **Save email credentials** securely in .env
6. **Use App Passwords** for Gmail (never regular password)
7. **Test with your own email** first before sharing

## 🚀 Production Deployment

For production environments:

1. **Deploy backend** to cloud service:
   - Heroku
   - AWS Lambda / EC2
   - Vercel Functions
   - DigitalOcean
   - Your own server

2. **Update frontend .env**:
   ```
   REACT_APP_API_URL=https://your-api-domain.com/api
   ```

3. **Enable HTTPS** (required for production)

4. **Add monitoring** and logging

5. **Implement rate limiting** at server level

## 📚 Additional Documentation

- **SETUP_EMAIL.md** - Detailed setup instructions
- **server/README.md** - Backend API documentation
- **server/.env.example** - Email configuration template

## ✨ What's Next?

Future enhancements:
- [ ] Email-based password recovery
- [ ] Email notifications for important events
- [ ] Multi-device sync via email verification
- [ ] Two-factor authentication (2FA)
- [ ] Email change verification
- [ ] Account deletion confirmation

---

## 🎉 Success!

Your MORTALS Dashboard now has professional-grade email verification while maintaining the option for local-only mode. The hybrid approach ensures maximum flexibility and security!

**Dashboard Philosophy Maintained:**
- ✅ Privacy-first (backend only for verification)
- ✅ Local-first (fallback mode available)
- ✅ Mortality-aware (philosophical messaging throughout)
- ✅ Professional security (real email verification)

**"We are all mortal. The question is: are we awake?"** ⏳
