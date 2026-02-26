'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

interface TestClockData {
  hasTestClock: boolean;
  testClock: any;
  currentTime: string;
  realTime: string;
}

export function TestClockControls() {
  const [testClockData, setTestClockData] = useState<TestClockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

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
      const response = await apiClient.post('/api/test-clock', {
        apiName: 'Create Test Clock',
        apiCategory: 'Other',
        stripeEndpoint: 'POST /v1/test_helpers/test_clocks',
        body: {
          action: 'create',
          frozen_time: Math.floor(Date.now() / 1000),
        },
      });

      setMessage('✅ Test clock created! Refresh to see updated data.');
      await fetchTestClock();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message || 'Failed to create test clock'}`);
    } finally {
      setLoading(false);
    }
  };

  const advanceTime = async (days: number) => {
    if (!testClockData?.testClock) {
      setMessage('❌ No active test clock found');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const currentTime = testClockData.testClock.frozen_time;
      const newTime = currentTime + (days * 24 * 60 * 60); // Add days in seconds

      const response = await apiClient.post('/api/test-clock', {
        apiName: 'Advance Test Clock',
        apiCategory: 'Other',
        stripeEndpoint: 'POST /v1/test_helpers/test_clocks/:id/advance',
        body: {
          action: 'advance',
          test_clock_id: testClockData.testClock.id,
          advance_to: newTime,
        },
      });

      setMessage(`✅ Advanced time by ${days} day(s)! Statements may generate automatically.`);

      // Wait a moment for Stripe to process, then refresh
      setTimeout(async () => {
        await fetchTestClock();
        // Trigger a page refresh to update all data
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message || 'Failed to advance test clock'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestClock = async () => {
    if (!testClockData?.testClock) return;

    if (!confirm('Are you sure you want to delete the test clock? This will reset to real time.')) {
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

      setMessage('✅ Test clock deleted! Using real time now.');
      await fetchTestClock();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message || 'Failed to delete test clock'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!testClockData) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              ⏰ Test Clock Controls
              {testClockData.hasTestClock && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-normal">
                  Active
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Control time for demo purposes - advance time to generate statements
            </p>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {testClockData.hasTestClock ? 'Test Clock Time' : 'Current Real Time'}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatDate(testClockData.currentTime, 'long')}
            </div>
            <div className="text-sm text-gray-600">
              {new Date(testClockData.currentTime).toLocaleTimeString()}
            </div>
          </div>
          {testClockData.hasTestClock && (
            <div className="border-l pl-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Actual Real Time</div>
              <div className="text-sm text-gray-600">
                {formatDate(testClockData.realTime, 'long')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                (Clock is frozen in test mode)
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!testClockData.hasTestClock ? (
          <div className="flex gap-3">
            <Button
              onClick={createTestClock}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : '🚀 Enable Test Clock'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={() => advanceTime(1)}
                disabled={loading}
                variant="secondary"
                size="sm"
              >
                ⏭️ +1 Day
              </Button>
              <Button
                onClick={() => advanceTime(7)}
                disabled={loading}
                variant="secondary"
                size="sm"
              >
                ⏭️ +1 Week
              </Button>
              <Button
                onClick={() => advanceTime(30)}
                disabled={loading}
                variant="secondary"
                size="sm"
              >
                ⏭️ +1 Month
              </Button>
              <Button
                onClick={deleteTestClock}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                🗑️ Delete Clock
              </Button>
            </div>

            <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
              <strong>💡 Demo Tip:</strong> Advance time by 1 month to close your billing period and
              generate a statement automatically!
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded text-sm ${
            message.startsWith('✅')
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {testClockData.hasTestClock && (
          <div className="text-xs text-gray-500 border-t pt-3">
            <strong>Test Clock ID:</strong> {testClockData.testClock.id}
          </div>
        )}
      </div>
    </Card>
  );
}
