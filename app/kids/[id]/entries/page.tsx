import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';

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

  // Get entries
  const entriesResult = await query(
    `
    SELECT
      be.*,
      u.username
    FROM behaviour_entries be
    JOIN users u ON be.user_id = u.id
    WHERE be.kid_id = $1
    ORDER BY be.event_date DESC
    LIMIT 50
  `,
    [id]
  );

  const entries = entriesResult.rows;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/kids"
              className="text-sm text-indigo-600 hover:text-indigo-500 mb-2 inline-block"
            >
              ← Back to kids
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {kid.name}'s Behaviour Journal
            </h1>
          </div>
          <Link
            href={`/kids/${id}/entries/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            + Add Entry
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No entries yet. Add your first entry!</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {entries.map((entry: any) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {new Date(entry.event_date).toLocaleString()}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.intensity === 'High'
                              ? 'bg-red-100 text-red-800'
                              : entry.intensity === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {entry.intensity || 'N/A'}
                        </span>
                      </div>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <dt className="font-medium text-gray-500">Trigger</dt>
                          <dd className="text-gray-900">
                            {entry.trigger || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">
                            Behaviour
                          </dt>
                          <dd className="text-gray-900">
                            {entry.behaviour || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">
                            Duration
                          </dt>
                          <dd className="text-gray-900">
                            {entry.duration_minutes
                              ? `${entry.duration_minutes} min`
                              : 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Outcome</dt>
                          <dd className="text-gray-900">
                            {entry.outcome || 'N/A'}
                          </dd>
                        </div>
                        {entry.resolution && (
                          <div className="sm:col-span-2">
                            <dt className="font-medium text-gray-500">
                              Resolution
                            </dt>
                            <dd className="text-gray-900">
                              {entry.resolution}
                            </dd>
                          </div>
                        )}
                        {entry.notes && (
                          <div className="sm:col-span-2">
                            <dt className="font-medium text-gray-500">Notes</dt>
                            <dd className="text-gray-900">{entry.notes}</dd>
                          </div>
                        )}
                      </dl>
                      <div className="mt-2 text-xs text-gray-500">
                        Recorded by {entry.username}
                      </div>
                    </div>
                    {session.role === 'admin' && (
                      <div className="ml-4 flex-shrink-0 flex gap-2">
                        <Link
                          href={`/kids/${id}/entries/${entry.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteButton entryId={entry.id} kidId={id} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
