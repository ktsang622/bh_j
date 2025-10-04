import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { spawn } from 'child_process';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const databaseUrl =
      process.env.DATABASE_URL ||
      'postgresql://behavior_user:behavior_pass@localhost:5432/behavior_journal';

    // Parse database URL to extract connection details
    const url = new URL(databaseUrl);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.slice(1);

    // Create a readable stream from pg_dump
    const pgDump = spawn('pg_dump', [
      '-h',
      host,
      '-p',
      port,
      '-U',
      username,
      '-d',
      database,
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
    ], {
      env: {
        ...process.env,
        PGPASSWORD: password,
      },
    });

    const stream = new ReadableStream({
      start(controller) {
        pgDump.stdout.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        pgDump.stderr.on('data', (chunk) => {
          console.error('pg_dump stderr:', chunk.toString());
        });

        pgDump.on('close', (code) => {
          if (code === 0) {
            controller.close();
          } else {
            controller.error(new Error(`pg_dump exited with code ${code}`));
          }
        });

        pgDump.on('error', (error) => {
          console.error('pg_dump error:', error);
          controller.error(error);
        });
      },
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `behavior_journal_backup_${timestamp}.sql`;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
