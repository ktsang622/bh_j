import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function BackupPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/kids');
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Database Backup</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Download a complete SQL backup of the database. This backup
              includes all users, kids, and behaviour entries.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notes:
              </h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                <li>This operation requires PostgreSQL pg_dump to be installed</li>
                <li>The backup will be downloaded as a .sql file</li>
                <li>Store backups securely as they contain sensitive data</li>
                <li>Regular backups are recommended for data safety</li>
              </ul>
            </div>

            <div className="pt-4">
              <a
                href="/api/backup"
                download
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Download Backup
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
