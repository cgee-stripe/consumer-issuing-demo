# Dogs R Us Credit Card Portal - Demo Guide

## 🎯 Customer Call Demo Flow

Use this guide to demonstrate the full credit card lifecycle during customer calls.

---

## 📋 Pre-Demo Setup

1. **Start the app**: `npm run dev`
2. **Open Dashboard**: Navigate to http://localhost:3000/dashboard
3. **Enable Test Clock**: Click "🚀 Enable Test Clock" at the top of the dashboard

---

## 🎬 Demo Script

### Part 1: Show Current State (2 minutes)

1. **Dashboard Overview**
   - Point out current balance, available credit, and rewards points
   - Show the card details
   - Highlight the payment due date

2. **Open API Console** (Right side panel)
   - Show real-time API calls happening behind the scenes
   - Explain each API category (Transactions, Ledger, etc.)

### Part 2: Make Purchases (3 minutes)

1. **Navigate to Store** (`/store`)
   - Say: "Let's make some purchases for our dog"
   - Select a few items (e.g., Premium Dog Food, Chew Toys)
   - Complete purchases

2. **Show Credit Ledger Updates**
   - Go back to Dashboard
   - Point out how Current Balance increased immediately
   - Open API Console to show the real-time API calls
   - Navigate to Transactions page to see itemized purchases

3. **Explain Real-Time Balance**
   - Current Balance = `obligations.accruing` (live, right now)
   - Statement Balance = from last closed billing period
   - These are intentionally different!

### Part 3: Generate Statement (5 minutes)

This is where Test Clocks shine!

1. **Advance Time**
   - Go back to Dashboard
   - In the Test Clock Controls panel, click **"⏭️ +1 Month"**
   - Say: "Let's fast forward time to close the billing period"
   - Wait 2-3 seconds for the page to refresh automatically

2. **View Generated Statement**
   - Navigate to Statements page (`/statements`)
   - Say: "A statement was automatically generated!"
   - Click to view the statement PDF
   - Show all transactions from the period
   - Point out:
     - Statement Balance
     - Minimum Payment
     - Due Date

3. **Explain Statement Generation**
   - Statements only generate when billing periods close
   - In production, this happens monthly automatically
   - For demos, we use Test Clocks to simulate time passing

### Part 4: Make a Payment (3 minutes)

1. **Navigate to Payments** (`/payments`)
   - Show the balance owed
   - Show minimum payment ($30)
   - Choose "Pay Statement Balance" or custom amount

2. **Complete Payment**
   - Select payment method
   - Click "Make Payment"
   - Show success confirmation

3. **Show Updated Balance**
   - Return to Dashboard
   - Point out Current Balance decreased
   - Show payment in transaction history

### Part 5: Rewards Redemption (2 minutes)

1. **Navigate to Rewards** (`/rewards`)
   - Show Paw Points balance
   - Browse reward catalog
   - Redeem a reward (creates a credit ledger adjustment)

2. **Show Credit Applied**
   - Return to Dashboard
   - Show how the credit reduced the balance
   - Open API Console to show the Credit Ledger Adjustment API call

---

## 💡 Demo Tips

### For Maximum Impact:

1. **Keep API Console Open**
   - Shows technical depth
   - Demonstrates API-first approach
   - Great for developer audiences

2. **Advance Time Multiple Times**
   - Show multiple billing cycles
   - Demonstrate statement history accumulation
   - Show how balances carry forward

3. **Create Multiple Purchases**
   - Makes the transaction list more realistic
   - Shows better data in statements
   - Demonstrates the ledger tracking accurately

4. **Highlight Real-Time Updates**
   - Point out instant balance updates
   - Show how Current Balance tracks obligations.accruing
   - Explain the difference between current vs statement balance

### Common Questions & Answers:

**Q: "Why is the statement balance different from current balance?"**
A: Statement Balance is a historical snapshot from the last closed billing period. Current Balance is real-time and includes all new activity since the statement was generated.

**Q: "How often do statements generate in production?"**
A: Statements generate automatically when billing periods close. The billing cycle is configured in the Credit Policy (typically monthly, but can be daily, weekly, etc.).

**Q: "Can I generate statements on-demand?"**
A: In test mode, yes! Use Test Clocks to advance time and trigger statement generation. In production, they generate automatically per the billing cycle.

**Q: "What's the Credit Ledger?"**
A: It's the source of truth for all credit activity - every transaction, payment, dispute, and adjustment creates a ledger entry. It powers both current balances and statement generation.

---

## 🔄 Resetting for Next Demo

After a demo, you can:

1. **Delete Test Clock**: Click "🗑️ Delete Clock" to return to real time
2. **Keep Test Clock**: Continue with the same data for multiple demos
3. **Create New Test Clock**: Delete old one and create fresh (starts time from now)

---

## 🎯 Key Points to Emphasize

1. **~20 Consumer Issuing APIs** integrated
2. **Real-time credit tracking** via Credit Ledger
3. **Automatic statement generation** when billing periods close
4. **API-first design** - every action hits Stripe APIs
5. **Production-ready architecture** - same patterns used in real credit card systems

---

## 🚨 Troubleshooting

### Test Clock Not Working?
- Make sure you clicked "Enable Test Clock" first
- Check that your Stripe account supports Test Clocks (test mode only)
- Ensure STRIPE_SECRET_KEY and STRIPE_CONNECTED_ACCOUNT_ID are set

### Statements Not Generating?
- Wait 2-3 seconds after advancing time
- The page should auto-refresh
- Check that you advanced at least 1 month (or 1 billing cycle period)
- Statements only generate when a complete billing period closes

### API Calls Failing?
- Check that STRIPE_SECRET_KEY is valid
- Ensure STRIPE_CONNECTED_ACCOUNT_ID is correct
- Verify you're using the beta API version: `2025-01-27.acacia; issuing_credit_beta=v3`

---

## 📞 Questions?

If you encounter issues or have questions about the demo, check:
- The API Console for detailed error messages
- Browser console for frontend errors
- `/tmp/nextjs-dev.log` for backend errors
