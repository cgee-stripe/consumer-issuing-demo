'use client';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, Christina! 🐕</h2>
          <p className="text-sm text-gray-600">Manage your Dogs R Us credit card</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Christina Gee</p>
            <p className="text-xs text-gray-500">cgee+test@dogsrus.com</p>
          </div>
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">
            CG
          </div>
        </div>
      </div>
    </header>
  );
}
