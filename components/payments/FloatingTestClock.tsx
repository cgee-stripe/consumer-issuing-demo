'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

interface TestClockData {
  hasTestClock: boolean;
  testClock: any;
  currentTime: string;
  realTime: string;
}

interface FloatingTestClockProps {
  onTimeAdvanced?: () => void;
}

export function FloatingTestClock({ onTimeAdvanced }: FloatingTestClockProps) {
  const [testClockData, setTestClockData] = useState<TestClockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchTestClock = async () => {
    try {
      const data = await apiClient.get('/api/test-clock', {
        apiName: 'Get Test Clock Status',
        apiCategory: 'Other',
        stripeEndpoint: 'GET /v1/test_helpers/test_clocks',
      });
      setTestClockData(data.data);
    } catch (error) {
      console.error('Failed to fetch test clock:', error);
    }
  };

  useEffect(() => {
    fetchTestClock();
  }, []);

  const createTestClock = async () => {
    setLoading(true);
    setMessage('');
    try {
      await apiClient.post('/api/test-clock', {
        apiName: 'Create Test Clock',
        apiCategory: 'Other',
        stripeEndpoint: 'POST /v1/test_helpers/test_clocks',
        body: {
          action: 'create',
          frozen_time: Math.floor(Date.now() / 1000),
        },
      });

      setMessage('✅ Test clock created!');
      await fetchTestClock();
    } catch (error: any) {
      setMessage(`❌ ${error.message || 'Failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const advanceTime = async (days: number) => {
    if (!testClockData?.testClock) {
      setMessage('❌ No test clock');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const currentTime = testClockData.testClock.frozen_time;
      const newTime = currentTime + (days * 24 * 60 * 60);

      await apiClient.post('/api/test-clock', {
        apiName: 'Advance Test Clock',
        apiCategory: 'Other',
        stripeEndpoint: 'POST /v1/test_helpers/test_clocks/:id/advance',
        body: {
          action: 'advance',
          test_clock_id: testClockData.testClock.id,
          advance_to: newTime,
        },
      });

      setMessage(`✅ Advanced ${days} day(s)!`);

      setTimeout(async () => {
        await fetchTestClock();
        if (onTimeAdvanced) {
          onTimeAdvanced();
        }
      }, 2000);
    } catch (error: any) {
      setMessage(`❌ ${error.message || 'Failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestClock = async () => {
    if (!testClockData?.testClock) return;

    if (!confirm('⚠️ Reset Test Clock?\n\nThis will delete the current test clock and return to real time. You can then create a new one starting from today.\n\nContinue?')) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await apiClient.post('/api/test-clock', {
        apiName: 'Delete Test Clock',
        apiCategory: 'Other',
        stripeEndpoint: 'DELETE /v1/test_helpers/test_clocks/:id',
        body: {
          action: 'delete',
          test_clock_id: testClockData.testClock.id,
        },
      });

      setMessage('✅ Test clock deleted! Refresh to create a new one.');

      setTimeout(async () => {
        await fetchTestClock();
        if (onTimeAdvanced) {
          onTimeAdvanced();
        }
        // Reload the page to reset everything
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setMessage(`❌ ${error.message || 'Failed to delete'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!testClockData) {
    return null;
  }

  return (
    <div className="fixed bottom-32 right-6 z-40 w-96">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-200 overflow-hidden">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              <div>
                <h3 className="font-bold">Test Clock</h3>
                <p className="text-xs opacity-90">
                  {testClockData.hasTestClock ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <button className="text-white hover:bg-white/20 p-2 rounded">
              {isExpanded ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {/* Current Time */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {testClockData.hasTestClock ? 'Frozen Time' : 'Real Time'}
              </div>
              <div className="text-sm font-bold text-gray-900">
                {formatDate(testClockData.currentTime, 'long')}
              </div>
              <div className="text-xs text-gray-600">
                {new Date(testClockData.currentTime).toLocaleTimeString()}
              </div>
            </div>

            {/* Actions */}
            {!testClockData.hasTestClock ? (
              <Button
                onClick={createTestClock}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading ? 'Creating...' : '🚀 Enable Test Clock'}
              </Button>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => advanceTime(1)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    +1 Day
                  </Button>
                  <Button
                    onClick={() => advanceTime(7)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    +1 Week
                  </Button>
                  <Button
                    onClick={() => advanceTime(30)}
                    disabled={loading}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    +1 Month
                  </Button>
                </div>

                <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
                  <p className="font-semibold mb-2">📋 Demo Flow:</p>
                  <ol className="space-y-1 text-xs list-decimal list-inside">
                    <li>Go to Store & make purchases</li>
                    <li>Come back here</li>
                    <li>Click &quot;+1 Month&quot; to close period</li>
                    <li>Statement will auto-generate! 🎉</li>
                  </ol>
                </div>

                {/* Reset Button */}
                <Button
                  onClick={deleteTestClock}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-600 hover:bg-red-50"
                >
                  🔄 Reset Test Clock
                </Button>
              </>
            )}

            {/* Status Message */}
            {message && (
              <div className={`p-2 rounded text-xs ${
                message.startsWith('✅')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
