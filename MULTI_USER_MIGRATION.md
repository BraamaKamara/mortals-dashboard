# Multi-User Migration Guide

## What's Changing

### Before (Current)
- ✗ Single user per browser
- ✗ All data in localStorage
- ✗ No cross-device access
- ✗ Eternal Board comments don't persist
- ✗ Subscriptions tracked in JSON file

### After (Multi-User)
- ✓ Multiple users can access the app
- ✓ Data stored in PostgreSQL database
- ✓ Access from any device
- ✓ Real-time social features (posts/comments)
- ✓ Subscriptions properly tracked per user

## Installation Progress

### Completed
1. ✓ Created database schema design
2. ✓ Installed Node packages (pg, bcrypt, jsonwebtoken)
3. ✓ Created database connection module (db.js)
4. ✓ Created database initialization script (init-db.js)
5. ✓ Updated .env template with database config

### Next Steps

#### 1. Complete PostgreSQL Installation
**Status**: Installing (342 MB download in progress)

**After installation completes:**
- During setup, you'll create a password for the `postgres` user
- **Remember this password** - you'll need it for DATABASE_URL

#### 2. Run Database Setup
```powershell
.\setup-database.bat
```

This will:
- Create the `mortals_dashboard` database
- Run init-db.js to create all tables
- Guide you through .env configuration

#### 3. Update Environment Variables

Edit `server\.env` and set:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mortals_dashboard
JWT_SECRET=generate-a-long-random-string-here
```

**To generate a secure JWT secret:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## What's Being Built

### Backend APIs (server/index.js)

**Authentication Endpoints:**
- POST `/api/auth/signup` - Create new user account
- POST `/api/auth/login` - Login and get JWT token
- POST `/api/auth/logout` - Invalidate session
- GET `/api/auth/me` - Get current user info
- POST `/api/auth/verify-email` - Verify email (already exists)

**Subscription Endpoints:**
- Already have checkout/portal/webhook
- Will update to use database instead of entitlements.json

**Social Endpoints (Eternal Board):**
- GET `/api/posts` - Get all posts with pagination
- POST `/api/posts` - Create new post
- GET `/api/posts/:id/comments` - Get post comments
- POST `/api/posts/:id/comments` - Add comment
- POST `/api/posts/:id/like` - Like a post

**User Data Endpoints:**
- GET `/api/moods` - Get user's mood history (optional)
- POST `/api/moods` - Save mood entry (optional)

### Frontend Updates

**AuthGate Component:**
- Replace localStorage hash checking with API calls
- Signup: POST to `/api/auth/signup`
- Login: POST to `/api/auth/login`, store JWT token
- Remove local passphrase hashing (server handles security)

**App.js:**
- Add JWT token to all API requests (Authorization header)
- Store token in localStorage (not sensitive data)
- Add token refresh logic

**EternalBoard Component:**
- Fetch posts from API instead of hardcoded data
- Add real-time commenting
- Show user avatars and names
- Add like/unlike functionality

**UserMenu:**
- Show actual logged-in user info from API
- Logout clears token and redirects to login

## Migration Strategy

### Phase 1: Core Auth (Priority 1)
1. Build user signup/login API
2. Update AuthGate to use API
3. Test: Create account, logout, login again
4. **Result**: Multi-user auth working

### Phase 2: Subscriptions (Priority 2)
1. Migrate entitlements.json to database
2. Update webhook to save to database
3. Link subscriptions to user accounts
4. **Result**: Subscriptions tied to users

### Phase 3: Social Features (Priority 3)
1. Build posts/comments API
2. Update EternalBoard to fetch from API
3. Add real-time updates
4. **Result**: True multi-user board

### Phase 4: Optional Enhancements
1. Mood data sync to server
2. Profile management API
3. Forgot password flow
4. Email notifications

## Security Features

- **Passwords**: Bcrypt hashed (12 rounds)
- **Sessions**: JWT tokens with expiration (7 days default)
- **API Protection**: Middleware validates JWT on protected routes
- **SQL Injection**: Parameterized queries prevent attacks
- **CORS**: Configured for localhost:3000 in development

## Testing Plan

After each phase:
1. Create new user account
2. Login from different browser (incognito)
3. Verify data isolation (users can't see each other's private data)
4. Test social features (posts/comments visible to all)
5. Test subscription flow (payment → upgrade → portal)

## Current Status

⏳ Waiting for PostgreSQL installation to complete
✓ Database packages installed
✓ Database schema designed
✓ Connection module created
✓ Init script ready

**Next action**: Wait for PostgreSQL install, then run `setup-database.bat`
