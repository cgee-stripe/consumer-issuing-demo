'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Statement {
  id: string;
  period_start: number | null;
  period_end: number | null;
  created: number;
  amount_due: number;
  amount_paid: number;
  balance: number;
  status: string;
  currency: string;
  due_date: number | null;
  statement_url?: string;
}

interface StatementPreviewProps {
  refreshTrigger?: number;
}

export function StatementPreview({ refreshTrigger }: StatementPreviewProps) {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get('/api/statements', {
        apiName: 'List Credit Statements',
        apiCategory: 'Account',
        stripeEndpoint: 'GET /v1/issuing/credit_statements',
      });
      setStatements(data.data.statements || []);
    } catch (error: any) {
      console.error('Failed to fetch statements:', error);
      setError(error.message || 'Failed to load statements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Statements</h2>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Generated Statements</h2>
        <Button onClick={fetchStatements} variant="ghost" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {statements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-600 mb-2">No statements generated yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Statements generate automatically when billing periods close.
          </p>
          <div className="bg-blue-50 p-4 rounded text-sm text-left max-w-md mx-auto">
            <p className="font-semibold text-blue-900 mb-2">💡 To generate a statement:</p>
            <ol className="text-blue-800 space-y-1 list-decimal list-inside">
              <li>Enable the Test Clock (bottom right)</li>
              <li>Make some purchases on the store</li>
              <li>Click &quot;+1 Month&quot; to close the billing period</li>
              <li>Your statement will appear here!</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {statements.map((statement) => {
            // Helper function to safely format dates
            const formatStatementDate = (timestamp?: number) => {
              if (!timestamp) return 'N/A';
              try {
                return formatDate(new Date(timestamp * 1000).toISOString(), 'short');
              } catch (e) {
                return 'N/A';
              }
            };

            return (
              <div
                key={statement.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Statement {statement.id.substring(0, 15)}...
                    </h3>
                    {statement.period_start && statement.period_end ? (
                      <p className="text-sm text-gray-600">
                        {formatStatementDate(statement.period_start)}
                        {' - '}
                        {formatStatementDate(statement.period_end)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Created: {formatStatementDate(statement.created)}
                      </p>
                    )}
                  </div>
                  {statement.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statement.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : statement.status === 'open'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {statement.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Statement Balance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(statement.balance / 100, statement.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Minimum Payment</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(statement.amount_due / 100, statement.currency)}
                    </p>
                  </div>
                </div>

                {statement.due_date && (
                  <div className="text-xs text-gray-600 mb-3">
                    Due: {formatStatementDate(statement.due_date)}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/statements`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      // Download statement PDF
                      window.open(`/api/statements/download?id=${statement.id}`, '_blank');
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    📥 PDF
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="text-center pt-4 border-t">
            <Link href="/statements">
              <Button variant="ghost" size="sm">
                View All Statements →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
