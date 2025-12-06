#!/bin/bash
# MORTALS Dashboard - Automated Deployment Setup
# This script helps you prepare for Vercel deployment

echo "════════════════════════════════════════════════════"
echo "MORTALS Dashboard - Production Deployment Setup"
echo "════════════════════════════════════════════════════"
echo ""

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Install from https://nodejs.org"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git not found. Install from https://git-scm.com"
        exit 1
    fi
    
    echo "✅ Node.js: $(node --version)"
    echo "✅ Git: $(git --version)"
    echo ""
}

# Step 1: Generate JWT Secret
generate_jwt_secret() {
    echo "Step 1: Generate JWT Secret"
    echo "────────────────────────────"
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "Generated JWT Secret:"
    echo "$JWT_SECRET"
    echo ""
    echo "💾 Save this value for environment variables!"
    echo ""
}

# Step 2: Initialize Git repos
init_git() {
    echo "Step 2: Initialize Git Repositories"
    echo "────────────────────────────────────"
    
    read -p "Have you created GitHub repos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please create two GitHub repos:"
        echo "1. mortals-backend"
        echo "2. mortals-dashboard"
        echo "Then run this script again."
        exit 1
    fi
    
    echo ""
}

# Step 3: Database setup instructions
setup_database_instructions() {
    echo "Step 3: Setup PostgreSQL Database (Neon.tech)"
    echo "──────────────────────────────────────────────"
    echo "1. Go to https://neon.tech and create account"
    echo "2. Create new project: 'mortals-dashboard'"
    echo "3. Copy connection string"
    echo "4. Save it for environment variables"
    echo ""
    read -p "Connection string ready? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    echo ""
}

# Step 4: Collect environment variables
collect_env_vars() {
    echo "Step 4: Collect Environment Variables"
    echo "──────────────────────────────────────"
    
    read -p "Backend repository URL (e.g., https://github.com/user/mortals-backend): " BACKEND_REPO
    read -p "Frontend repository URL (e.g., https://github.com/user/mortals-dashboard): " FRONTEND_REPO
    read -p "Database connection string: " DATABASE_URL
    read -p "Gmail address: " EMAIL_USER
    read -p "Gmail app password: " EMAIL_PASSWORD
    read -p "Stripe Live Secret Key (sk_live_...): " STRIPE_SECRET_KEY
    read -p "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
    read -p "Stripe Price ID (price_...): " STRIPE_PRICE_PRO
    
    echo ""
    echo "All variables collected!"
    echo ""
}

# Step 5: Display deployment checklist
show_checklist() {
    echo "════════════════════════════════════════════════════"
    echo "DEPLOYMENT CHECKLIST"
    echo "════════════════════════════════════════════════════"
    echo ""
    echo "Before deploying to Vercel, ensure:"
    echo ""
    echo "Backend (.env.production):"
    echo "  [ ] DATABASE_URL = $DATABASE_URL"
    echo "  [ ] JWT_SECRET = $JWT_SECRET"
    echo "  [ ] EMAIL_USER = $EMAIL_USER"
    echo "  [ ] EMAIL_PASSWORD = (app password)"
    echo "  [ ] STRIPE_SECRET_KEY = sk_live_..."
    echo "  [ ] STRIPE_WEBHOOK_SECRET = whsec_..."
    echo ""
    echo "Frontend (Vercel env vars):"
    echo "  [ ] REACT_APP_API_URL = https://backend-url.vercel.app/api"
    echo "  [ ] REACT_APP_SOCKET_URL = https://backend-url.vercel.app"
    echo ""
    echo "GitHub:"
    echo "  [ ] Backend repo ready: $BACKEND_REPO"
    echo "  [ ] Frontend repo ready: $FRONTEND_REPO"
    echo ""
    echo "Vercel:"
    echo "  [ ] Account created at https://vercel.com"
    echo "  [ ] Stripe account ready at https://stripe.com"
    echo ""
}

# Run all steps
check_prerequisites
generate_jwt_secret
init_git
setup_database_instructions
collect_env_vars
show_checklist

echo "════════════════════════════════════════════════════"
echo "NEXT STEPS:"
echo "════════════════════════════════════════════════════"
echo ""
echo "1. Push to GitHub:"
echo "   cd mortals-dashboard/server && git add . && git commit -m 'Initial' && git push -u origin main"
echo "   cd .. && git add . && git commit -m 'Initial' && git push -u origin main"
echo ""
echo "2. Deploy Backend:"
echo "   - Go to https://vercel.com/new"
echo "   - Import mortals-backend repo"
echo "   - Add environment variables (see PRODUCTION_DEPLOYMENT.md)"
echo "   - Deploy"
echo ""
echo "3. Deploy Frontend:"
echo "   - Go to https://vercel.com/new"
echo "   - Import mortals-dashboard repo"
echo "   - Add REACT_APP_API_URL from backend deployment"
echo "   - Deploy"
echo ""
echo "4. Update Backend:"
echo "   - Add FRONTEND_URL from frontend deployment"
echo "   - Redeploy"
echo ""
echo "For detailed instructions, see: PRODUCTION_DEPLOYMENT.md"
echo "════════════════════════════════════════════════════"
