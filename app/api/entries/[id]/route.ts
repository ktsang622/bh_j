import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(); // Allow all authenticated users to edit

    const { id } = await params;
    const body = await request.json();
    const {
      event_date,
      trigger,
      behaviour,
      intensity,
      duration_minutes,
      resolution,
      outcome,
      notes,
    } = body;

    const result = await query(
      `UPDATE behaviour_entries SET
        event_date = $1,
        trigger = $2,
        behaviour = $3,
        intensity = $4,
        duration_minutes = $5,
        resolution = $6,
        outcome = $7,
        notes = $8
      WHERE id = $9
      RETURNING *`,
      [
        event_date,
        trigger,
        behaviour,
        intensity,
        duration_minutes,
        resolution,
        outcome,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Entries PUT error:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const result = await query(
      'DELETE FROM behaviour_entries WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Entries DELETE error:', error);

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
