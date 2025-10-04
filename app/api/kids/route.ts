import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Kid } from '@/lib/types';

export async function GET() {
  try {
    await requireAuth();

    const result = await query('SELECT id, name FROM kids ORDER BY id');

    const kids: Kid[] = result.rows;

    return NextResponse.json({ kids });
  } catch (error) {
    console.error('Kids API error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
