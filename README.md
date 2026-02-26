# Dogs R Us Credit Card Portal 🐕💳

A professional demo consumer credit card portal showcasing Stripe's Consumer Issuing APIs. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring a unique dog-themed rewards program and a real-time API developer console.

## ✨ Features

### Core Functionality
- **Dashboard**: Card overview, balance stats, recent transactions, and quick actions
- **Transactions**: Full transaction history with filtering, search, and export capabilities
- **Payments**: Make payments with multiple amount options and view payment history
- **Rewards**: Dog-themed "Paw Points" rewards program with tiered benefits
- **Card Management**: View card details, freeze/unfreeze card, manage spending limits
- **Account Settings**: Profile information and preferences management

### 🔧 API Developer Console (Star Feature)
- **Real-time API Logging**: Automatically captures all Stripe API calls
- **Detailed Request/Response Inspection**: View full payloads with syntax highlighting
- **Category Filtering**: Filter by API type (Transactions, Payments, Ledger, etc.)
- **Copy & Export**: Copy individual requests or export all logs as JSON
- **Keyboard Shortcut**: Toggle console with ⌘K (Cmd+K)
- **Color-coded Categories**: Visual categorization of different API types

### 🎨 Design
- **Playful Fintech Aesthetic**: Professional with dog-themed touches
- **Custom Color Palette**: Warm orange primary, deep blue secondary, light purple accent
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Polished transitions throughout

## 🚀 Quick Start

### Prerequisites
- Node.js 18.14.0 or higher
- npm 9.4.2 or higher

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd dog-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Stripe test keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
dog-marketplace/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # Main dashboard
│   ├── transactions/            # Transaction history
│   ├── payments/                # Payment interface
│   ├── rewards/                 # Rewards program
│   ├── card/                    # Card details & controls
│   ├── account/                 # Account settings
│   └── api/                     # Backend API routes
│       ├── transactions/
│       ├── payments/
│       ├── card/
│       ├── account/
│       ├── disputes/
│       └── rewards/
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── Header.tsx           # Top header
│   │   └── ApiConsole.tsx       # ⭐ API developer console
│   ├── dashboard/               # Dashboard components
│   ├── transactions/            # Transaction components
│   ├── payments/                # Payment components
│   ├── rewards/                 # Rewards components
│   ├── shared/                  # Shared UI components
│   └── icons/                   # Custom icons (PawIcon)
├── lib/                         # Utility libraries
│   ├── api-client.ts            # Frontend API wrapper with logging
│   ├── stripe.ts                # Server-side Stripe client
│   ├── utils.ts                 # Helper functions
│   └── mock-data.ts             # Mock data for demo
├── context/                     # React Context providers
│   └── ApiLoggerContext.tsx     # API logging state management
├── types/                       # TypeScript type definitions
│   ├── api.ts
│   ├── transaction.ts
│   ├── payment.ts
│   └── card.ts
└── hooks/                       # Custom React hooks
    └── useApiLogger.ts
```

## 🎯 How to Use the API Console

The API console is the standout feature that visualizes all Stripe API calls happening "under the hood."

### Opening the Console
- **Button**: Click the "🔧 API Console" button in the bottom-right corner
- **Keyboard**: Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)

### Features
1. **View API Calls**: All API requests are automatically logged as you interact with the app
2. **Expand Details**: Click any log entry to see full request and response payloads
3. **Filter by Category**: Use the dropdown to filter by API type (Transactions, Payments, etc.)
4. **Copy Data**: Click "Copy" buttons to copy request/response JSON
5. **Export Logs**: Click "Export JSON" to download all logs
6. **Clear Logs**: Click "Clear All" to reset the console

### Color Codes
- 🔵 Blue: Transactions API
- 🟢 Green: Repayments API
- 🟣 Purple: Ledger API
- 🟡 Yellow: Account API
- 🔴 Red: Disputes API
- 🟣 Indigo: Card API

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the color palette:
```typescript
colors: {
  primary: '#FF6B35',   // Warm orange
  secondary: '#1A508B', // Deep blue
  accent: '#A480CF',    // Light purple
}
```

### Branding
Replace logo and assets in:
- `public/images/logo.svg`
- `components/icons/PawIcon.tsx`

## 🔌 Stripe API Integration

The app is structured to easily integrate real Stripe Consumer Issuing APIs:

### Current State
- Using mock data from `lib/mock-data.ts`
- API routes in `app/api/*` return mock responses

### To Integrate Real APIs

1. **Update API Routes**: Replace mock data with actual Stripe API calls
   ```typescript
   // Example: app/api/transactions/route.ts
   import { stripe } from '@/lib/stripe';

   export async function GET(request: NextRequest) {
     const transactions = await stripe.issuing.transactions.list({
       limit: 50,
     });
     return NextResponse.json({ success: true, data: transactions });
   }
   ```

2. **Add Stripe API Endpoints**: Implement ~20 Consumer Issuing APIs:
   - Transactions (list, retrieve, search)
   - Repayments (create, list)
   - Ledger (entries, balance)
   - Account Status
   - Disputes (create, list, update)
   - Card details
   - Authorization controls
   - Spending limits
   - Card lifecycle operations

3. **Update Types**: Modify TypeScript types in `types/` to match actual Stripe API responses

## 📦 Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚢 Deployment

The app is ready to deploy to any Next.js-compatible platform:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
- **Netlify**: Connect GitHub repo and deploy
- **AWS Amplify**: Use Next.js preset
- **Docker**: Create Dockerfile with Node.js base image

### Environment Variables
Make sure to set these in your deployment platform:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
PORT=3001 npm run dev
```

### API Console Not Showing Logs
- Make sure you're using `apiClient` from `lib/api-client.ts` for all API calls
- Check browser console for errors
- Verify ApiLoggerProvider wraps your app in `app/layout.tsx`

### Stripe API Errors
- Verify your API keys are correct in `.env.local`
- Ensure you're using test mode keys (start with `sk_test_`)
- Check Stripe Dashboard for API logs

## 📚 Learning Resources

This project demonstrates:
- **Next.js 14 App Router**: Modern React framework with server components
- **TypeScript**: Type-safe JavaScript for better DX
- **Tailwind CSS**: Utility-first CSS framework
- **React Context**: State management for API logging
- **API Design**: Frontend-backend communication patterns
- **Stripe Integration**: Working with payment APIs

## 🎓 Educational Value

Building this project teaches:
1. Modern web development with Next.js and TypeScript
2. Designing and consuming REST APIs
3. State management with React Context
4. Component-driven development
5. Responsive design with Tailwind CSS
6. Real-world application architecture

## 🤝 Contributing

This is a demo project, but suggestions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and demos.

## 🐕 About Dogs R Us

Dogs R Us is a fictional credit card brand created for this demo. The dog theme makes the portal memorable while showcasing Stripe's serious financial infrastructure capabilities.

---

**Built with ❤️ using Stripe, Next.js, and lots of paw prints**

For questions or issues, please open an issue on GitHub.
