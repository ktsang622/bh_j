import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import jsPDF from 'jspdf';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
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
    const entries = result.rows;

    if (format === 'csv') {
      const csvHeaders = [
        'ID',
        'Child',
        'Date/Time',
        'Trigger',
        'Behaviour',
        'Intensity',
        'Duration (min)',
        'Resolution',
        'Outcome',
        'Notes',
        'Recorded By',
      ];

      const csvRows = entries.map((entry: any) => [
        entry.id,
        entry.kid_name,
        new Date(entry.event_date).toLocaleString(),
        entry.trigger || '',
        entry.behaviour || '',
        entry.intensity || '',
        entry.duration_minutes || '',
        entry.resolution || '',
        entry.outcome || '',
        entry.notes || '',
        entry.username,
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: any[]) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="behaviour-entries-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      doc.setFontSize(16);
      doc.text('Behaviour Journal Entries', 15, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      entries.forEach((entry: any, index: number) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(`Entry #${entry.id} - ${entry.kid_name}`, 15, yPosition);
        yPosition += 6;
        doc.text(
          `Date: ${new Date(entry.event_date).toLocaleString()}`,
          15,
          yPosition
        );
        yPosition += 6;
        doc.text(`Trigger: ${entry.trigger || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Behaviour: ${entry.behaviour || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(`Intensity: ${entry.intensity || 'N/A'}`, 15, yPosition);
        yPosition += 6;
        doc.text(
          `Duration: ${entry.duration_minutes || 'N/A'} minutes`,
          15,
          yPosition
        );
        yPosition += 6;
        doc.text(`Outcome: ${entry.outcome || 'N/A'}`, 15, yPosition);
        yPosition += 6;

        if (entry.resolution) {
          const resolutionLines = doc.splitTextToSize(
            `Resolution: ${entry.resolution}`,
            180
          );
          doc.text(resolutionLines, 15, yPosition);
          yPosition += resolutionLines.length * 6;
        }

        if (entry.notes) {
          const notesLines = doc.splitTextToSize(`Notes: ${entry.notes}`, 180);
          doc.text(notesLines, 15, yPosition);
          yPosition += notesLines.length * 6;
        }

        doc.text(`Recorded by: ${entry.username}`, 15, yPosition);
        yPosition += 10;
      });

      const pdfBuffer = doc.output('arraybuffer');

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="behaviour-entries-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use csv or pdf' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Export error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
