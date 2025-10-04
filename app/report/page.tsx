'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Kid {
  id: number;
  name: string;
}

export default function ReportPage() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetch('/api/kids')
      .then((res) => res.json())
      .then((data) => setKids(data.kids));
  }, []);

  const handleExport = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    if (selectedKid) params.append('kid_id', selectedKid);
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    params.append('format', format);

    window.location.href = `/api/entries/export?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/kids"
            className="text-sm text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
          >
            ← Back to kids
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Export Reports</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="kid"
                className="block text-sm font-medium text-gray-700"
              >
                Child (optional)
              </label>
              <select
                id="kid"
                value={selectedKid}
                onChange={(e) => setSelectedKid(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              >
                <option value="">All children</option>
                {kids.map((kid) => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="from"
                className="block text-sm font-medium text-gray-700"
              >
                From Date (optional)
              </label>
              <input
                type="date"
                id="from"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>

            <div>
              <label
                htmlFor="to"
                className="block text-sm font-medium text-gray-700"
              >
                To Date (optional)
              </label>
              <input
                type="date"
                id="to"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
