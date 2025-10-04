import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import EntryForm from '@/components/EntryForm';

export default async function NewEntryPage({
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
          <h1 className="text-3xl font-bold text-gray-900">
            Add Entry for {kid.name}
          </h1>
        </div>

        <EntryForm kidId={id} />
      </div>
    </div>
  );
}
