'use client';

import { useEffect, useState } from 'react';
import { FloatingTestClock } from '@/components/payments/FloatingTestClock';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';

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

export default function StatementsPage() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStatements();
  }, [refreshTrigger]);

  const fetchStatements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get('/api/statements', {
        apiName: 'List Credit Statements',
        apiCategory: 'Statements',
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

  const handleTimeAdvanced = () => {
    // Refresh statements when time is advanced
    setRefreshTrigger(prev => prev + 1);
  };

  const formatStatementDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    try {
      return formatDate(new Date(timestamp * 1000).toISOString(), 'long');
    } catch (e) {
      return 'N/A';
    }
  };

  const renderStatementContent = (statement: Statement) => {
    return (
      <>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                Statement
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                statement.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : statement.status === 'finalized'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {statement.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Statement ID: <span className="font-mono text-xs">{statement.id}</span>
            </p>
          </div>

          {statement.statement_url && (
            <Button
              onClick={() => window.open(statement.statement_url, '_blank')}
              variant="secondary"
              size="sm"
            >
              📥 Download PDF
            </Button>
          )}
        </div>

        {/* Period */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Statement Period
              </p>
              <p className="font-semibold text-gray-900 text-sm">
                {statement.period_start && statement.period_end ? (
                  <>
                    {formatStatementDate(statement.period_start)}
                    <br />
                    to {formatStatementDate(statement.period_end)}
                  </>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Statement Date
              </p>
              <p className="font-semibold text-gray-900 text-sm">
                {formatStatementDate(statement.created)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Payment Due Date
              </p>
              <p className="font-semibold text-gray-900 text-sm">
                {formatStatementDate(statement.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="border-t pt-4">
          <h4 className="text-md font-bold text-gray-900 mb-3">Balance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Statement Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(statement.balance / 100, statement.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total owed at period end
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Minimum Payment</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(statement.amount_due / 100, statement.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Due by {formatStatementDate(statement.due_date)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(statement.amount_paid / 100, statement.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Payments applied
              </p>
            </div>
          </div>
        </div>

        {/* Remaining Balance */}
        {statement.balance - statement.amount_paid > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-yellow-900 text-sm">Remaining Balance</p>
                <p className="text-xs text-yellow-700">
                  You still owe on this statement
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-yellow-900">
                  {formatCurrency(
                    (statement.balance - statement.amount_paid) / 100,
                    statement.currency
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-3 flex gap-2">
          {statement.statement_url && (
            <Button
              onClick={() => window.open(statement.statement_url, '_blank')}
              className="flex-1"
              size="sm"
            >
              View Full Statement PDF
            </Button>
          )}
          {statement.balance - statement.amount_paid > 0 && (
            <Button
              onClick={() => window.location.href = '/payments'}
              variant="secondary"
              className="flex-1"
              size="sm"
            >
              Make a Payment
            </Button>
          )}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Floating Test Clock - Positioned higher to avoid blocking API console */}
      <FloatingTestClock onTimeAdvanced={handleTimeAdvanced} />

      <div className="p-8 space-y-8 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Credit Statements</h1>
            <p className="text-gray-600">View and download your credit card statements</p>
          </div>

          {error && (
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-yellow-900">Error Loading Statements</h3>
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {statements.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Statements Yet</h2>
                <p className="text-gray-600 mb-4">
                  Statements are generated automatically at the end of each billing period.
                </p>
                <div className="bg-blue-50 p-4 rounded text-sm text-left max-w-md mx-auto">
                  <p className="font-semibold text-blue-900 mb-2">💡 To generate a statement:</p>
                  <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Enable the Test Clock (bottom right)</li>
                    <li>Make some purchases in the store</li>
                    <li>Click "+1 Month" to close the billing period</li>
                    <li>Your statement will be generated automatically!</li>
                  </ol>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Most Recent Statement - Highlighted */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Most Recent Statement</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    🆕 Latest
                  </span>
                </div>
                <Card className="border-2 border-primary shadow-lg">
                  {renderStatementContent(statements[0])}
                </Card>
              </div>

              {/* Previous Statements */}
              {statements.length > 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-600">Previous Statements</h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                      📋 Historical
                    </span>
                  </div>
                  <div className="space-y-4">
                    {statements.slice(1).map((statement) => (
                      <Card key={statement.id} className="opacity-90 hover:opacity-100 transition-opacity">
                        {renderStatementContent(statement)}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
