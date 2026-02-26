'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CardDisplay } from '@/components/dashboard/CardDisplay';
import { apiClient } from '@/lib/api-client';
import { Card as CardType } from '@/types/card';

export default function CardPage() {
  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCard();
  }, []);

  async function fetchCard() {
    try {
      const data = await apiClient.get('/api/card', {
        apiName: 'Get Card Details',
        apiCategory: 'Card',
      });
      setCard(data.data);
    } catch (error) {
      console.error('Failed to fetch card:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleCardStatus = async () => {
    if (!card) return;

    setIsUpdating(true);
    try {
      const newStatus = card.status === 'active' ? 'frozen' : 'active';
      const data = await apiClient.patch('/api/card', {
        apiName: 'Update Card Status',
        apiCategory: 'Card',
        body: { status: newStatus },
      });
      setCard(data.data);
    } catch (error) {
      console.error('Failed to update card:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Failed to load card details</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Card Details</h1>
          <p className="text-gray-600">Manage your Dogs R Us credit card</p>
        </div>

        {/* Card Display */}
        <div className="mb-8">
          <CardDisplay card={card} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Information */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Card Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Card Number</label>
                <div className="flex items-center gap-3 mt-1">
                  <p className="font-mono text-lg">
                    {showCardNumber ? '4242 4242 4242 4242' : `•••• •••• •••• ${card.last4}`}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                  >
                    {showCardNumber ? '👁️ Hide' : '👁️ Show'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Expiration Date</label>
                  <p className="font-mono text-lg mt-1">
                    {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">CVV</label>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="font-mono text-lg">{showCVV ? '123' : '•••'}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCVV(!showCVV)}
                    >
                      {showCVV ? '👁️' : '👁️'}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Cardholder Name</label>
                <p className="text-lg mt-1">{card.cardholderName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Card Status</label>
                <p className="text-lg mt-1 capitalize font-semibold">
                  {card.status === 'active' && '✅ '}
                  {card.status === 'frozen' && '❄️ '}
                  {card.status}
                </p>
              </div>
            </div>
          </Card>

          {/* Card Controls */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Card Controls</h2>
            <div className="space-y-6">
              {/* Freeze/Unfreeze Card */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {card.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {card.status === 'active'
                    ? 'Temporarily block all transactions on this card'
                    : 'Reactivate your card to resume transactions'}
                </p>
                <Button
                  variant={card.status === 'active' ? 'secondary' : 'primary'}
                  onClick={handleToggleCardStatus}
                  disabled={isUpdating}
                >
                  {isUpdating
                    ? 'Updating...'
                    : card.status === 'active'
                    ? '❄️ Freeze Card'
                    : '✅ Unfreeze Card'}
                </Button>
              </div>

              {/* Spending Limits */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Spending Limits</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Monthly Limit</span>
                    <span className="font-semibold text-gray-900">
                      ${card.spendingLimit?.toLocaleString() || 'Not set'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Spending Limits
                  </Button>
                </div>
              </div>

              {/* Report Lost/Stolen */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-red-600 mb-2">Report Lost or Stolen</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If your card is lost or stolen, report it immediately to prevent unauthorized
                  use
                </p>
                <Button variant="outline" size="sm" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                  🚨 Report Card
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">🔒 Security Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Never share your card number, CVV, or PIN with anyone</li>
            <li>• Monitor your transactions regularly for unauthorized charges</li>
            <li>• Freeze your card immediately if you notice suspicious activity</li>
            <li>• Enable transaction alerts in your account settings</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
