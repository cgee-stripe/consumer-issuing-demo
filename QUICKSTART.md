# Quick Start Guide 🚀

Get the Dogs R Us Credit Card Portal running in 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js 18.17.0+ (check with `node --version`)
- ✅ npm 9+ (check with `npm --version`)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```
*This will take 1-2 minutes*

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

**Optional**: Add your Stripe test API keys to `.env.local`
- Get keys from: https://dashboard.stripe.com/test/apikeys
- The app works with mock data even without real keys!

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Open Your Browser
Navigate to: **http://localhost:3000**

You'll be automatically redirected to the dashboard!

## First Steps in the App

1. **Explore the Dashboard** - See your card, balance, and recent transactions
2. **Open the API Console** - Click the "🔧 API Console" button in the bottom-right (or press ⌘K)
3. **Make a Transaction** - Click around to see API calls logged in real-time
4. **Try Making a Payment** - Go to Payments page and submit a test payment
5. **Check Out Rewards** - View your Paw Points and available rewards

## Using the API Console

The API Console is the coolest feature! Here's how to use it:

### Opening
- **Button**: Bottom-right corner button
- **Keyboard**: `⌘K` (Mac) or `Ctrl+K` (Windows)

### What You'll See
- All API calls are logged automatically as you use the app
- Click any entry to expand and see full request/response
- Use filters to view specific API categories
- Copy or export logs for debugging

### Example Workflow
1. Go to Transactions page
2. Open API Console
3. Watch the "List Transactions" API call appear
4. Click to expand and see the full JSON response
5. Copy the response to share with your team

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Nothing Shows Up
- Check browser console for errors
- Make sure you're on http://localhost:3000
- Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

## Next Steps

- 📖 Read the full [README.md](./README.md) for detailed documentation
- 🔌 Integrate real Stripe APIs (see README for instructions)
- 🎨 Customize colors and branding
- 🚀 Deploy to Vercel, Netlify, or your favorite platform

## Getting Help

- Check the [README.md](./README.md) for detailed docs
- Look at code comments for explanations
- Search for "TODO" in the codebase for integration points

## Demo Credentials

The app uses mock data, so no login is required. You'll automatically be signed in as "Alex Johnson" with a demo Dogs R Us credit card.

---

**You're all set! Enjoy exploring the Dogs R Us Credit Card Portal!** 🐕💳
