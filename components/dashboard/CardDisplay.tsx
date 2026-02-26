'use client';

import { Card as CardType } from '@/types/card';
import { PawIcon } from '@/components/icons/PawIcon';
import { useCustomization } from '@/context/CustomizationContext';

interface CardDisplayProps {
  card: CardType;
}

export function CardDisplay({ card }: CardDisplayProps) {
  const { settings } = useCustomization();

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Credit Card Design */}
      <div className="relative h-56 rounded-2xl overflow-hidden shadow-2xl">
        {/* Card Background - Gradient with dog paw pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-600 to-secondary">
          {/* Decorative paw prints */}
          <div className="absolute top-4 right-4 opacity-20">
            <PawIcon className="w-20 h-20" />
          </div>
          <div className="absolute bottom-8 left-8 opacity-10">
            <PawIcon className="w-16 h-16" />
          </div>
        </div>

        {/* Card Content */}
        <div className="relative h-full p-6 flex flex-col justify-between text-white">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.companyLogo ? (
                <img src={settings.companyLogo} alt="Company Logo" className="w-8 h-8 object-contain" />
              ) : (
                <PawIcon className="w-8 h-8" />
              )}
              <div>
                <div className="text-sm font-bold">{settings.companyName}</div>
                <div className="text-xs opacity-80">Credit Card</div>
              </div>
            </div>
            <div className="text-sm font-semibold px-3 py-1 bg-white/20 rounded-full">
              {card.brand}
            </div>
          </div>

          {/* Card Number */}
          <div>
            <div className="text-xl font-mono tracking-wider mb-1">
              •••• •••• •••• {card.last4}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs opacity-70 mb-1">Cardholder</div>
              <div className="text-sm font-semibold">{card.cardholderName}</div>
            </div>
            <div>
              <div className="text-xs opacity-70 mb-1">Expires</div>
              <div className="text-sm font-semibold">
                {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Status Badge */}
      <div className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
        {card.status === 'active' && '✓ Active'}
        {card.status === 'frozen' && '❄️ Frozen'}
        {card.status === 'cancelled' && '✕ Cancelled'}
      </div>
    </div>
  );
}
