# MORTALS Dashboard

A philosophical mortality-awareness platform featuring real-time messaging, bookmarks, meditation, and premium features.

## Quick Start - Local Development

### Prerequisites
- Node.js 16+ (https://nodejs.org)
- npm or yarn

### Installation & Running

```bash
# Install dependencies (both frontend & backend)
npm install
cd server && npm install && cd ..

# Start backend (in one terminal)
npm run start:backend

# Start frontend (in another terminal)
npm run start:frontend

# Or start both at once
npm run start:all
```

Frontend: http://localhost:3000  
Backend: http://localhost:3001

## Deployment to Production

This app is ready for production deployment on **Vercel** + **Neon.tech PostgreSQL**.

### Quick Setup
```bash
# Run deployment setup script
./deploy.bat         # Windows
./deploy.sh          # Mac/Linux
```

Or follow the detailed guide:

📖 **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Complete step-by-step deployment guide

### What You'll Need
- Vercel account (free at https://vercel.com)
- Neon.tech PostgreSQL (free at https://neon.tech)
- GitHub account for code hosting
- Gmail + app password for email verification
- Stripe account (optional, for premium features)

### Deployment Summary
1. Create PostgreSQL database on Neon.tech
2. Push code to GitHub (backend & frontend separate repos)
3. Deploy backend to Vercel with environment variables
4. Deploy frontend to Vercel with API URL
5. Configure Stripe webhooks and email

**Estimated time: 30-45 minutes**

## Available Scripts (Local Development)

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Eternal Board (new)

Eternal Board is a premium-feel space to leave short dictums about life. It stores notes locally in your browser (no server), supports export/import as JSON, and opens via a floating button on the dashboard.

- Open the dashboard and click the “Eternal Board” button in the bottom-right.
- Write your dictum (up to ~480 characters) and Post.
- Export your dictums as a JSON file or import a previous export.

Notes are saved under localStorage key `mortals.eternalBoard.posts`. Your author name is read from your saved username if you used the Auth gate, otherwise it defaults to “Anonymous Mortal”.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
