import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { Kid } from '@/lib/types';
import Link from 'next/link';

export default async function KidsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const result = await query('SELECT id, name FROM kids ORDER BY id');
  const kids: Kid[] = result.rows;

  async function handleLogout() {
    'use server';
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Behaviour Journal
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Logged in as {session.username} ({session.role})
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/report"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Reports
            </Link>
            {session.role === 'admin' && (
              <Link
                href="/admin/backup"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Backup
              </Link>
            )}
            <form action={handleLogout}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select a child to view or add entries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kids.map((kid) => (
              <Link
                key={kid.id}
                href={`/kids/${kid.id}/entries`}
                className="block p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <h3 className="text-lg font-medium text-indigo-900">
                  {kid.name}
                </h3>
                <p className="mt-1 text-sm text-indigo-600">
                  View journal entries →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
