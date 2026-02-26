import Link from 'next/link';
import { Button } from '@/components/shared/Button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center p-8">
        <div className="text-8xl mb-4">🐕</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Oops! Looks like this pup wandered off. The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard">
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
