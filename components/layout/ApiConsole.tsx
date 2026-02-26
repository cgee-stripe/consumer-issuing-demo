'use client';

import { useApiLogger } from '@/hooks/useApiLogger';
import { ApiCategory } from '@/types/api';
import { formatDateTime, copyToClipboard, cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { setApiLogFunction } from '@/lib/api-client';

const categoryColors: Record<ApiCategory, string> = {
  Transactions: 'bg-blue-500',
  Repayments: 'bg-green-500',
  Ledger: 'bg-purple-500',
  Account: 'bg-yellow-500',
  Disputes: 'bg-red-500',
  Card: 'bg-indigo-500',
  Authorization: 'bg-pink-500',
  'Spending Limits': 'bg-orange-500',
  Other: 'bg-gray-500',
};

export function ApiConsole() {
  const { logs, clearLogs, isConsoleOpen, toggleConsole, addLog } = useApiLogger();
  const [filter, setFilter] = useState<ApiCategory | 'all'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const pathname = usePathname();

  // Clear logs when navigating to a new page
  useEffect(() => {
    clearLogs();
  }, [pathname, clearLogs]);

  // Register the log function with the API client when component mounts
  useEffect(() => {
    setApiLogFunction(addLog);
  }, [addLog]);

  // Keyboard shortcut: Cmd+K to toggle console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleConsole();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleConsole]);

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.apiCategory === filter);

  const handleCopy = async (text: string, id: string) => {
    try {
      await copyToClipboard(text);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExportAll = () => {
    const exportData = JSON.stringify(logs, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={toggleConsole}
        className={cn(
          'fixed bottom-6 right-6 z-40 px-4 py-3 rounded-lg shadow-lg font-medium transition-all',
          'hover:scale-105 active:scale-95',
          isConsoleOpen
            ? 'bg-secondary text-white'
            : 'bg-primary text-white hover:bg-primary-600'
        )}
        title="Toggle API Console (⌘K)"
      >
        {isConsoleOpen ? '✕ Close' : '🔧 API Console'}
        {logs.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
            {logs.length}
          </span>
        )}
      </button>

      {/* Sliding Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-gray-900 text-white shadow-2xl z-50',
          'transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isConsoleOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div>
            <h2 className="text-xl font-bold">API Developer Console</h2>
            <p className="text-sm text-gray-400">Real-time Stripe API call monitoring</p>
          </div>
          <button
            onClick={toggleConsole}
            className="p-2 hover:bg-gray-700 rounded"
            aria-label="Close console"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-gray-400">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ApiCategory | 'all')}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {Object.keys(categoryColors).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              disabled={logs.length === 0}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">🐕</div>
              <p className="text-lg">No API calls yet</p>
              <p className="text-sm">Interact with the app to see API calls logged here</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Log Header */}
                <div
                  className="p-3 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() =>
                    setExpandedLogId(expandedLogId === log.id ? null : log.id)
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium text-white',
                          categoryColors[log.apiCategory]
                        )}
                      >
                        {log.apiCategory}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-mono',
                          log.statusCode >= 200 && log.statusCode < 300
                            ? 'bg-green-900 text-green-200'
                            : 'bg-red-900 text-red-200'
                        )}
                      >
                        {log.statusCode}
                      </span>
                      <span className="text-xs text-gray-400">{log.duration}ms</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-blue-400">{log.method}</span>
                    <span className="text-sm font-mono text-gray-300">{log.endpoint}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{log.apiName}</p>
                  {log.error && (
                    <p className="text-sm text-red-400 mt-1">⚠️ {log.error}</p>
                  )}
                </div>

                {/* Expandable Details */}
                {expandedLogId === log.id && (
                  <div className="border-t border-gray-700 p-3 space-y-3">
                    {/* Request Payload */}
                    {log.requestPayload && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-300">
                            Request Payload
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(
                                JSON.stringify(log.requestPayload, null, 2),
                                `${log.id}-req`
                              )
                            }
                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            {copySuccess === `${log.id}-req` ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          language="json"
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            maxHeight: '200px',
                          }}
                        >
                          {JSON.stringify(log.requestPayload, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    )}

                    {/* Response Data */}
                    {log.responseData && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-300">
                            Response Data
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(
                                JSON.stringify(log.responseData, null, 2),
                                `${log.id}-res`
                              )
                            }
                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            {copySuccess === `${log.id}-res` ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          language="json"
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            maxHeight: '200px',
                          }}
                        >
                          {JSON.stringify(log.responseData, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isConsoleOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleConsole}
        />
      )}
    </>
  );
}
