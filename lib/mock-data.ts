import { Transaction } from '@/types/transaction';
import { Payment, BalanceInfo } from '@/types/payment';
import { Card, AccountStatus, Dispute, Reward, RewardsBalance } from '@/types/card';

// Mock transaction data
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    amount: -49.99,
    currency: 'USD',
    merchant: 'PetSmart',
    merchantCategory: 'Pet Supplies',
    status: 'completed',
    date: '2026-02-15T14:30:00Z',
    description: 'Dog food and toys',
    category: 'Shopping',
  },
  {
    id: 'txn_002',
    amount: -125.00,
    currency: 'USD',
    merchant: 'Veterinary Clinic',
    merchantCategory: 'Healthcare',
    status: 'completed',
    date: '2026-02-12T10:15:00Z',
    description: 'Annual checkup',
    category: 'Healthcare',
  },
  {
    id: 'txn_003',
    amount: -32.50,
    currency: 'USD',
    merchant: 'Woof & Wash',
    merchantCategory: 'Services',
    status: 'completed',
    date: '2026-02-10T16:45:00Z',
    description: 'Dog grooming',
    category: 'Services',
  },
  {
    id: 'txn_004',
    amount: -89.99,
    currency: 'USD',
    merchant: 'Chewy.com',
    merchantCategory: 'Pet Supplies',
    status: 'completed',
    date: '2026-02-08T09:20:00Z',
    description: 'Monthly subscription box',
    category: 'Shopping',
  },
  {
    id: 'txn_005',
    amount: -15.00,
    currency: 'USD',
    merchant: 'Dog Park Cafe',
    merchantCategory: 'Food & Beverage',
    status: 'pending',
    date: '2026-02-18T12:00:00Z',
    description: 'Coffee and treats',
    category: 'Food',
  },
];

// Mock payment data
export const mockPayments: Payment[] = [
  {
    id: 'pmt_001',
    amount: 312.48,
    currency: 'USD',
    status: 'completed',
    date: '2026-02-01T00:00:00Z',
    paymentMethod: 'Bank Account ****1234',
    confirmationNumber: 'CONF-2026-02-001',
  },
  {
    id: 'pmt_002',
    amount: 450.00,
    currency: 'USD',
    status: 'completed',
    date: '2026-01-01T00:00:00Z',
    paymentMethod: 'Bank Account ****1234',
    confirmationNumber: 'CONF-2026-01-001',
  },
];

// Mock balance info
export const mockBalanceInfo: BalanceInfo = {
  currentBalance: 312.48,
  availableCredit: 4687.52,
  creditLimit: 5000.00,
  minimumPayment: 35.00,
  statementBalance: 312.48,
  dueDate: '2026-03-01T00:00:00Z',
  currency: 'USD',
};

// Mock card data
export const mockCard: Card = {
  id: 'card_001',
  last4: '4242',
  brand: 'Visa',
  expiryMonth: 12,
  expiryYear: 2028,
  cardholderName: 'Alex Johnson',
  status: 'active',
  spendingLimit: 1000,
  spendingLimitInterval: 'monthly',
};

// Mock account status
export const mockAccountStatus: AccountStatus = {
  accountId: 'acc_001',
  status: 'active',
  accountHolder: 'Alex Johnson',
  email: 'test@example.com',
  phone: '+1 (555) 123-4567',
  since: '2024-06-15T00:00:00Z',
};

// Mock disputes
export const mockDisputes: Dispute[] = [
  {
    id: 'dsp_001',
    transactionId: 'txn_003',
    amount: 32.50,
    reason: 'Service not as described',
    status: 'pending',
    createdDate: '2026-02-11T10:00:00Z',
  },
];

// Mock rewards - cashback redemption for dog-themed items
export const mockRewards: Reward[] = [
  {
    id: 'rwd_001',
    name: 'Premium Dog Toy Bundle',
    description: 'A collection of durable, fun toys for your furry friend',
    pointsCost: 5,
    category: 'toys',
    available: true,
  },
  {
    id: 'rwd_002',
    name: 'Gourmet Dog Treat Box',
    description: 'Healthy, delicious treats your dog will love',
    pointsCost: 3,
    category: 'treats',
    available: true,
  },
  {
    id: 'rwd_003',
    name: '$50 PetSmart Gift Card',
    description: 'Use at any PetSmart location or online',
    pointsCost: 10,
    category: 'supplies',
    available: true,
  },
  {
    id: 'rwd_004',
    name: 'Professional Grooming Session',
    description: 'Full grooming service at a participating location',
    pointsCost: 8,
    category: 'services',
    available: true,
  },
  {
    id: 'rwd_005',
    name: 'Dog Training Class',
    description: '6-week basic obedience course',
    pointsCost: 15,
    category: 'services',
    available: true,
  },
];

// Mock rewards balance
export const mockRewardsBalance: RewardsBalance = {
  points: 1250,
  tier: 'good-boy',
  pointsToNextTier: 750,
};
