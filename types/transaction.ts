export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: string;
  status: 'pending' | 'completed' | 'declined';
  date: string; // ISO date string
  description?: string;
  category?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: Transaction['status'];
  search?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  hasMore: boolean;
  total: number;
}
