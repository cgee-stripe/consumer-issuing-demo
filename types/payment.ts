export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  date: string; // ISO date string
  paymentMethod: string;
  confirmationNumber?: string;
}

export interface PaymentRequest {
  amount: number;
  paymentMethod: 'bank_account' | 'debit_card';
  scheduledDate?: string;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  total: number;
}

export interface BalanceInfo {
  currentBalance: number;
  availableCredit: number;
  creditLimit: number;
  minimumPayment: number;
  statementBalance: number;
  dueDate: string;
  currency: string;
}
