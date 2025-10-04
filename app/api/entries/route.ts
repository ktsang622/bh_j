import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { BehaviourEntry } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const kid_id = searchParams.get('kid_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let queryText = `
      SELECT
        be.*,
        k.name as kid_name,
        u.username
      FROM behaviour_entries be
      JOIN kids k ON be.kid_id = k.id
      JOIN users u ON be.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (kid_id) {
      queryText += ` AND be.kid_id = $${paramCount}`;
      params.push(parseInt(kid_id));
      paramCount++;
    }

    if (from) {
      queryText += ` AND be.event_date >= $${paramCount}`;
      params.push(from);
      paramCount++;
    }

    if (to) {
      queryText += ` AND be.event_date <= $${paramCount}`;
      params.push(to);
      paramCount++;
    }

    queryText += ' ORDER BY be.event_date DESC';

    const result = await query(queryText, params);

    return NextResponse.json({ entries: result.rows });
  } catch (error) {
    console.error('Entries GET error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const {
      kid_id,
      event_date,
      trigger,
      behaviour,
      intensity,
      duration_minutes,
      resolution,
      outcome,
      notes,
    } = body;

    if (!kid_id) {
      return NextResponse.json(
        { error: 'kid_id is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO behaviour_entries (
        kid_id, user_id, event_date, trigger, behaviour, intensity,
        duration_minutes, resolution, outcome, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        kid_id,
        user.id,
        event_date || new Date().toISOString(),
        trigger,
        behaviour,
        intensity,
        duration_minutes,
        resolution,
        outcome,
        notes,
      ]
    );

    return NextResponse.json({ entry: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Entries POST error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
