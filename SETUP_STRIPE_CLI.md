# Stripe CLI Setup for Local Development

## Why You Need This
Stripe webhooks can't reach `localhost` during testing. The Stripe CLI forwards webhook events from Stripe's servers to your local backend.

## Installation Steps

### Option 1: Using Scoop (Recommended for Windows)
```powershell
# Install Scoop if you don't have it
iwr -useb get.scoop.sh | iex

# Install Stripe CLI
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Option 2: Direct Download
1. Download from: https://github.com/stripe/stripe-cli/releases/latest
2. Look for `stripe_X.X.X_windows_x86_64.zip`
3. Extract to a folder (e.g., `C:\stripe`)
4. Add that folder to your PATH environment variable

### Option 3: Using Winget (Windows 11)
```powershell
winget install stripe.stripe-cli
```

## Setup Steps

### 1. Login to Stripe
```powershell
stripe login
```
This will open your browser to authorize the CLI with your Stripe account.

### 2. Get Webhook Signing Secret
```powershell
stripe listen --forward-to http://localhost:3001/api/billing/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Update Your Backend .env
Copy the `whsec_...` secret and update `server/.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 4. Keep It Running
Leave the `stripe listen` command running in a terminal while testing. It will forward all webhook events to your local server.

## Testing the Full Flow

1. **Terminal 1** - Start backend:
   ```powershell
   cd server
   npm start
   ```

2. **Terminal 2** - Start Stripe CLI:
   ```powershell
   stripe listen --forward-to http://localhost:3001/api/billing/webhook
   ```

3. **Terminal 3** - Start frontend:
   ```powershell
   npm start
   ```

4. Now complete a test payment - you'll see webhook events appear in Terminal 2!

## Quick Test Command
To test if webhooks are working:
```powershell
stripe trigger checkout.session.completed
```

## Automated Script
I've created `start-backend-with-stripe.bat` that does this automatically, but you'll still need to:
1. Install Stripe CLI first
2. Run `stripe login` once
3. Update the webhook secret in `.env`
