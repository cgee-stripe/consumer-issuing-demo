'use client';

import { useEffect, useState } from 'react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { Card } from '@/components/shared/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { Transaction, TransactionFilters as Filters } from '@/types/transaction';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchData = async () => {
    try {
      // Fetch transactions
      const transactionsData = await apiClient.get('/api/transactions', {
        apiName: 'List Transactions',
        apiCategory: 'Transactions',
        stripeEndpoint: 'GET /v1/issuing/transactions',
      });
      setTransactions(transactionsData.data.transactions);
      setFilteredTransactions(transactionsData.data.transactions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFiltersChange = (filters: Filters) => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.merchant.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date >= new Date(filters.startDate!) && date <= new Date(filters.endDate!);
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Merchant', 'Category', 'Status', 'Amount'].join(','),
      ...filteredTransactions.map((t) =>
        [
          t.date,
          t.merchant,
          t.merchantCategory,
          t.status,
          t.amount,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm md:text-base text-gray-600">View and manage your transaction history</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6">
          <TransactionFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Transaction List */}
        <Card className="mt-6" padding="none">
          <TransactionList
            transactions={filteredTransactions}
            onTransactionClick={setSelectedTransaction}
          />
        </Card>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedTransaction(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Merchant</p>
                  <p className="font-semibold">{selectedTransaction.merchant}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-bold text-lg">
                    {selectedTransaction.amount < 0 ? '-' : '+'}$
                    {Math.abs(selectedTransaction.amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{new Date(selectedTransaction.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="capitalize">{selectedTransaction.status}</p>
                </div>
                {selectedTransaction.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{selectedTransaction.description}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
