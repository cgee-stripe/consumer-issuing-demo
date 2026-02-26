# Stripe API Integration Guide 🔌

This guide walks you through integrating the ~20 Stripe Consumer Issuing APIs into the Dogs R Us portal.

## Current State

The app currently uses **mock data** from `lib/mock-data.ts`. All API routes return simulated responses. This allows the app to run and demonstrate functionality without real Stripe credentials.

## Prerequisites

Before integrating real Stripe APIs:

1. **Stripe Account**: Sign up at https://stripe.com
2. **Test API Keys**: Get from https://dashboard.stripe.com/test/apikeys
3. **Consumer Issuing Access**: Contact Stripe to enable Consumer Issuing APIs on your account
4. **API Documentation**: Review Stripe's Consumer Issuing docs

## Integration Steps

### 1. Set Up Stripe Client

✅ **Already Done!** The Stripe client is configured in `lib/stripe.ts`

Add your keys to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_your_real_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_real_key_here
```

### 2. Update API Routes

Replace mock data with real Stripe API calls. Here's the pattern:

#### Example: Transactions API

**Current (Mock):**
```typescript
// app/api/transactions/route.ts
import { mockTransactions } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json({
    success: true,
    data: { transactions: mockTransactions, hasMore: false, total: mockTransactions.length },
  });
}
```

**Updated (Real Stripe):**
```typescript
// app/api/transactions/route.ts
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const transactions = await stripe.issuing.transactions.list({
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.data,
        hasMore: transactions.has_more,
        total: transactions.data.length,
      },
    });
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
```

### 3. APIs to Integrate

Here are the ~20 Consumer Issuing APIs to integrate:

#### Transactions APIs
- [ ] `stripe.issuing.transactions.list()` - List all transactions
- [ ] `stripe.issuing.transactions.retrieve(id)` - Get transaction details
- [ ] `stripe.issuing.transactions.search()` - Search transactions

**File**: `app/api/transactions/route.ts`

#### Repayments APIs
- [ ] `stripe.issuing.payments.create()` - Create a payment
- [ ] `stripe.issuing.payments.list()` - List payment history
- [ ] `stripe.issuing.payments.retrieve(id)` - Get payment details

**File**: `app/api/payments/route.ts`

#### Ledger APIs
- [ ] `stripe.issuing.ledger.list()` - List ledger entries
- [ ] `stripe.issuing.ledger.retrieve(id)` - Get ledger entry
- [ ] `stripe.issuing.balance.get()` - Get current balance

**File**: `app/api/ledger/route.ts`, `app/api/payments/balance/route.ts`

#### Card APIs
- [ ] `stripe.issuing.cards.list()` - List cards
- [ ] `stripe.issuing.cards.retrieve(id)` - Get card details
- [ ] `stripe.issuing.cards.update(id, params)` - Update card (freeze/unfreeze)
- [ ] `stripe.issuing.cards.create()` - Create new card

**File**: `app/api/card/route.ts`

#### Authorization APIs
- [ ] `stripe.issuing.authorizations.list()` - List authorizations
- [ ] `stripe.issuing.authorizations.approve(id)` - Approve authorization
- [ ] `stripe.issuing.authorizations.decline(id)` - Decline authorization

**File**: Create `app/api/authorizations/route.ts`

#### Disputes APIs
- [ ] `stripe.issuing.disputes.create()` - Create dispute
- [ ] `stripe.issuing.disputes.list()` - List disputes
- [ ] `stripe.issuing.disputes.update(id)` - Update dispute

**File**: `app/api/disputes/route.ts`

#### Account/Cardholder APIs
- [ ] `stripe.issuing.cardholders.retrieve(id)` - Get cardholder details
- [ ] `stripe.issuing.cardholders.update(id)` - Update cardholder

**File**: `app/api/account/route.ts`

#### Spending Controls
- [ ] `stripe.issuing.cards.update()` - Update spending limits
- [ ] Set authorization controls

**File**: Update `app/api/card/route.ts`

### 4. Update TypeScript Types

Match your types to Stripe's actual response structures:

```typescript
// types/transaction.ts
import Stripe from 'stripe';

export type Transaction = Stripe.Issuing.Transaction;

// Or create custom interfaces that match your needs:
export interface Transaction {
  id: string;
  amount: number;
  merchant: {
    name: string;
    category: string;
  };
  // ... map Stripe fields to your interface
}
```

### 5. Handle Pagination

Stripe APIs use cursor-based pagination:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startingAfter = searchParams.get('starting_after');

  const transactions = await stripe.issuing.transactions.list({
    limit: 50,
    starting_after: startingAfter || undefined,
  });

  return NextResponse.json({
    success: true,
    data: {
      transactions: transactions.data,
      hasMore: transactions.has_more,
      nextCursor: transactions.has_more ? transactions.data[transactions.data.length - 1].id : null,
    },
  });
}
```

### 6. Add Error Handling

Implement proper error handling for Stripe API errors:

```typescript
try {
  const result = await stripe.issuing.cards.update(cardId, {
    status: 'inactive',
  });
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  if (error instanceof Stripe.errors.StripeError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        type: error.type,
      },
      { status: error.statusCode || 500 }
    );
  }
  throw error;
}
```

### 7. Test with Stripe Test Data

Use Stripe's test mode features:
- Test card numbers: https://stripe.com/docs/testing
- Create test transactions in Stripe Dashboard
- Use webhooks for real-time updates (optional)

### 8. Update Frontend (if needed)

If Stripe's response structure differs from mock data:

1. Update type definitions in `types/`
2. Adjust component rendering logic
3. Update formatters in `lib/utils.ts`

## Testing Checklist

After integration, test:

- [ ] Dashboard loads with real data
- [ ] Transactions list displays correctly
- [ ] Payment submission works
- [ ] Card freeze/unfreeze functions
- [ ] API Console logs all Stripe calls
- [ ] Error handling works (try invalid inputs)
- [ ] Pagination works for large datasets

## Common Issues

### Issue: "No such customer"
**Solution**: Ensure you're using test data that exists in your Stripe account

### Issue: "API key invalid"
**Solution**: Check that your `.env.local` has the correct `sk_test_...` key

### Issue: "This API is not enabled"
**Solution**: Contact Stripe support to enable Consumer Issuing APIs

### Issue: Type mismatches
**Solution**: Update your TypeScript types to match Stripe's actual response structure

## Advanced: Webhooks

For production, set up webhooks to receive real-time updates:

1. Create webhook endpoint: `app/api/webhooks/stripe/route.ts`
2. Handle events:
   - `issuing.transaction.created`
   - `issuing.transaction.updated`
   - `issuing.authorization.request`
3. Update frontend state in real-time

## Resources

- **Stripe Issuing Docs**: https://stripe.com/docs/issuing
- **Stripe API Reference**: https://stripe.com/docs/api/issuing
- **Stripe Node.js Library**: https://github.com/stripe/stripe-node
- **Stripe Dashboard**: https://dashboard.stripe.com/test/issuing

## Need Help?

- Check Stripe's documentation
- Contact Stripe support for API access questions
- Review the example code in this codebase
- Look at Stripe's official examples

---

**Good luck with your integration! The mock data provides a solid foundation to build upon.** 🚀
