'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomization } from '@/context/CustomizationContext';

export default function HomePage() {
  const router = useRouter();
  const { settings } = useCustomization();

  useEffect(() => {
    // Redirect to dashboard on load (mock authentication)
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-8xl mb-4">🐕</div>
        <h1 className="text-3xl font-bold mb-2">{settings.companyName} Credit Card</h1>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
