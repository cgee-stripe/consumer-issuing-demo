import { useState } from 'react';
import { Statement } from '@/types/statement';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/shared/Card';
import { apiClient } from '@/lib/api-client';

interface StatementsListProps {
  statements: Statement[];
  onStatementsGenerated?: () => void;
}

export function StatementsList({ statements, onStatementsGenerated }: StatementsListProps) {
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  const handleViewPDF = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadPDF = async (statementId: string, periodStart: string | null) => {
    try {
      // Use our backend API to proxy the download with proper authentication
      const filename = periodStart
        ? `statement-${new Date(periodStart).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}.pdf`
        : `statement-${Date.now()}.pdf`;

      const response = await fetch(`/api/statements/download?id=${statementId}`);

      if (!response.ok) {
        throw new Error('Failed to download statement');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download statement. Please try again.');
    }
  };

  const getStatementDisplayName = (statement: Statement) => {
    if (statement.period_start && statement.period_end) {
      const startDate = new Date(statement.period_start);
      const endDate = new Date(statement.period_end);

      // If same month, show "January 2026"
      if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
        return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      // Otherwise show "Jan 15 - Feb 14, 2026"
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    return 'Statement';
  };

  const handleGenerateStatements = async () => {
    try {
      setGenerating(true);
      setGenerateMessage(null);

      const result = await apiClient.post('/api/statements/generate', {
        apiName: 'Generate Test Statements',
        apiCategory: 'Account',
        stripeEndpoint: 'POST /v1/test_helpers/issuing/credit_policies/:id/enable_statement_generation',
        body: {},
      });

      if (result.success) {
        setGenerateMessage(`✓ Statement generation triggered! Statements will appear in "pending" status first, then be finalized with amounts and PDFs in a few minutes. Refresh this page to check status.`);
        setTimeout(() => {
          if (onStatementsGenerated) {
            onStatementsGenerated();
          }
        }, 3000);
      } else {
        setGenerateMessage(`⚠️ ${result.error}`);
      }
    } catch (error: any) {
      setGenerateMessage(`⚠️ Error: ${error.message || 'Failed to generate statements'}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Credit Statements</h2>
        <button
          onClick={handleGenerateStatements}
          disabled={generating}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {generating ? '⏳ Generating...' : '📄 Generate Statement'}
        </button>
      </div>

      {generateMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          generateMessage.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
        }`}>
          {generateMessage}
        </div>
      )}

      {statements.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-gray-600">No statements available yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Make some purchases in the Store, then click "Generate Statement" above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {statements.map((statement) => (
            <div
              key={statement.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {getStatementDisplayName(statement)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                      statement.status === 'generated'
                        ? 'bg-green-100 text-green-800'
                        : statement.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {statement.status === 'pending' ? '⏳ Pending' : statement.status}
                  </span>
                </div>
                {statement.status === 'pending' ? (
                  <p className="text-sm text-gray-500 italic">
                    Statement is being processed. Amounts will be finalized shortly.
                  </p>
                ) : (
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>
                      Balance: <span className="font-medium">{formatCurrency(statement.balance, 'USD')}</span>
                    </span>
                    <span>
                      Amount Due: <span className="font-medium">{formatCurrency(statement.amount_due, 'USD')}</span>
                    </span>
                    {statement.due_date && (
                      <span>
                        Due Date: <span className="font-medium">{formatDate(statement.due_date, 'short')}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-4 flex gap-2">
                {statement.statement_url ? (
                  <>
                    <button
                      onClick={() => handleViewPDF(statement.statement_url!)}
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-600 transition-colors font-medium"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(statement.id, statement.period_start)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                      📥 Download
                    </button>
                  </>
                ) : (
                  <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg font-medium text-sm">
                    {statement.status === 'pending' ? '⏳ Processing...' : 'PDF Not Available'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
