export interface Card {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  status: 'active' | 'frozen' | 'cancelled';
  spendingLimit?: number;
  spendingLimitInterval?: 'daily' | 'weekly' | 'monthly';
}

export interface CardDetails extends Card {
  fullNumber?: string; // Only shown when user clicks "reveal"
  cvv?: string; // Only shown when user clicks "reveal"
}

export interface AccountStatus {
  accountId: string;
  status: 'active' | 'suspended' | 'closed';
  accountHolder: string;
  email: string;
  phone: string;
  since: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'won' | 'lost';
  createdDate: string;
  resolvedDate?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'toys' | 'treats' | 'supplies' | 'services';
  imageUrl?: string;
  available: boolean;
}

export interface RewardsBalance {
  points: number;
  tier: 'puppy' | 'good-boy' | 'best-friend' | 'top-dog';
  pointsToNextTier: number;
}
