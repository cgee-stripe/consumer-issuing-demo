'use client';

import { TransactionFilters as Filters } from '@/types/transaction';
import { useState } from 'react';
import { Button } from '@/components/shared/Button';

interface TransactionFiltersProps {
  onFiltersChange: (filters: Filters) => void;
}

export function TransactionFilters({ onFiltersChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Merchant or description..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') {
                handleFilterChange('startDate', undefined);
                handleFilterChange('endDate', undefined);
              } else if (value === '7days') {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                handleFilterChange('startDate', startDate.toISOString());
                handleFilterChange('endDate', new Date().toISOString());
              } else if (value === '30days') {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                handleFilterChange('startDate', startDate.toISOString());
                handleFilterChange('endDate', new Date().toISOString());
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
