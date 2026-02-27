'use client';

import { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { useCustomization } from '@/context/CustomizationContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
}

export default function StorePage() {
  const { settings } = useCustomization();

  // Use store items from customization settings
  const products: Product[] = settings.storeItems.filter(item => item.available);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<string>('');

  const handlePurchase = async (product: Product) => {
    setPurchasing(product.id);
    setShowSuccess(false);

    try {
      const response = await apiClient.post('/api/store/purchase', {
        apiName: 'Create Authorization & Capture',
        apiCategory: 'Transactions',
        stripeEndpoint: 'POST /v1/test_helpers/issuing/authorizations',
        body: {
          productId: product.id,
          productName: product.name,
          amount: product.price,
          category: product.category,
        },
      });

      console.log('Purchase successful:', product.name);
      setLastPurchase(product.name);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Purchase failed for', product.name, ':', error);
      alert(`Purchase failed for ${product.name}: ${error.message || 'Please try again.'}`);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{settings.companyName} Store 💳🛒</h1>
          <p className="text-sm md:text-base text-gray-600">
            Shop for your furry friend using your {settings.companyName} Credit Card!
          </p>
        </div>

        {showSuccess && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="font-bold text-green-900">Purchase Successful!</h3>
                <p className="text-green-700">
                  {lastPurchase} has been added to your transactions.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="text-6xl mb-4 text-center">{product.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-2xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                <Button
                  onClick={() => handlePurchase(product)}
                  disabled={purchasing !== null}
                  size="sm"
                >
                  {purchasing === product.id ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Purchasing...
                    </span>
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Demo Mode</h3>
              <p className="text-blue-700 text-sm">
                These are test purchases that will instantly appear in your Recent Transactions.
                In test mode, transactions are simulated using Stripe&apos;s test helpers.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
