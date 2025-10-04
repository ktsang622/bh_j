import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import EntryForm from '@/components/EntryForm';

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const { id, entryId } = await params;

  // Get entry
  const entryResult = await query(
    'SELECT * FROM behaviour_entries WHERE id = $1 AND kid_id = $2',
    [entryId, id]
  );

  if (entryResult.rows.length === 0) {
    redirect(`/kids/${id}/entries`);
  }

  const entry = entryResult.rows[0];

  // Get kid info
  const kidResult = await query('SELECT id, name FROM kids WHERE id = $1', [
    id,
  ]);

  const kid = kidResult.rows[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Entry for {kid.name}
          </h1>
        </div>

        <EntryForm kidId={id} entry={entry} />
      </div>
    </div>
  );
}
