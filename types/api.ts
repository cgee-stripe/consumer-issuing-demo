// API logging types for the developer console
export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  apiName: string;
  apiCategory: ApiCategory;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  endpoint: string;
  requestPayload?: any;
  responseData?: any;
  statusCode: number;
  duration: number; // in milliseconds
  error?: string;
}

export type ApiCategory =
  | 'Transactions'
  | 'Repayments'
  | 'Ledger'
  | 'Account'
  | 'Disputes'
  | 'Card'
  | 'Authorization'
  | 'Spending Limits'
  | 'Other';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
