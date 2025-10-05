import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import EntryForm from '@/components/EntryForm';
import Link from 'next/link';

export default async function EntriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  // Get kid info
  const kidResult = await query('SELECT id, name FROM kids WHERE id = $1', [
    id,
  ]);

  if (kidResult.rows.length === 0) {
    redirect('/kids');
  }

  const kid = kidResult.rows[0];

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Add Entry for {kid.name}
            </h1>
            <Link
              href={`/kids/${id}/entries/view`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Records
            </Link>
          </div>
        </div>

        <EntryForm kidId={id} />
      </div>
    </div>
  );
}
