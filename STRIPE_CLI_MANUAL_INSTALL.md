# Alternative: Manual Stripe CLI Installation

If Winget installation is having issues, you can install manually:

## Method 1: Direct Download

1. **Download the latest release:**
   - Go to: https://github.com/stripe/stripe-cli/releases/latest
   - Download: `stripe_X.X.X_windows_x86_64.zip`

2. **Extract to a permanent location:**
   ```powershell
   # Create a folder for Stripe CLI
   New-Item -Path "C:\stripe-cli" -ItemType Directory -Force
   
   # Extract the downloaded zip to this folder
   # You should have C:\stripe-cli\stripe.exe
   ```

3. **Add to PATH:**
   ```powershell
   # Add to PATH temporarily (current session only)
   $env:Path += ";C:\stripe-cli"
   
   # Or add permanently via System Properties > Environment Variables
   # Add C:\stripe-cli to your PATH variable
   ```

4. **Verify installation:**
   ```powershell
   stripe --version
   ```

## Method 2: Using Chocolatey (if you have it)

```powershell
choco install stripe-cli
```

## After Installation

Once `stripe --version` works, run:
```powershell
.\setup-stripe-webhooks.bat
```

This will:
1. Login to Stripe
2. Start webhook forwarding
3. Show you the webhook secret to add to `.env`
