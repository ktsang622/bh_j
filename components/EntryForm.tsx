'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TRIGGERS, BEHAVIOURS, INTENSITIES, OUTCOMES } from '@/lib/types';

interface EntryFormProps {
  kidId: string;
  entry?: any;
}

export default function EntryForm({ kidId, entry }: EntryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_date: entry?.event_date
      ? new Date(entry.event_date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    trigger: entry?.trigger || '',
    behaviour: entry?.behaviour || '',
    intensity: entry?.intensity || '',
    duration_minutes: entry?.duration_minutes || '',
    resolution: entry?.resolution || '',
    outcome: entry?.outcome || '',
    notes: entry?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = entry ? `/api/entries/${entry.id}` : '/api/entries';
      const method = entry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kid_id: parseInt(kidId),
          ...formData,
          duration_minutes: formData.duration_minutes
            ? parseInt(formData.duration_minutes.toString())
            : null,
        }),
      });

      if (response.ok) {
        router.push(`/kids/${kidId}/entries`);
        router.refresh();
      } else {
        alert('Failed to save entry');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="event_date"
            className="block text-sm font-medium text-gray-700"
          >
            Date & Time
          </label>
          <input
            type="datetime-local"
            id="event_date"
            value={formData.event_date}
            onChange={(e) =>
              setFormData({ ...formData, event_date: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="trigger"
            className="block text-sm font-medium text-gray-700"
          >
            Trigger
          </label>
          <select
            id="trigger"
            value={formData.trigger}
            onChange={(e) =>
              setFormData({ ...formData, trigger: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          >
            <option value="">Select trigger</option>
            {TRIGGERS.map((trigger) => (
              <option key={trigger} value={trigger}>
                {trigger}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="behaviour"
            className="block text-sm font-medium text-gray-700"
          >
            Behaviour
          </label>
          <select
            id="behaviour"
            value={formData.behaviour}
            onChange={(e) =>
              setFormData({ ...formData, behaviour: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          >
            <option value="">Select behaviour</option>
            {BEHAVIOURS.map((behaviour) => (
              <option key={behaviour} value={behaviour}>
                {behaviour}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="intensity"
            className="block text-sm font-medium text-gray-700"
          >
            Intensity
          </label>
          <select
            id="intensity"
            value={formData.intensity}
            onChange={(e) =>
              setFormData({ ...formData, intensity: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          >
            <option value="">Select intensity</option>
            {INTENSITIES.map((intensity) => (
              <option key={intensity} value={intensity}>
                {intensity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="duration_minutes"
            className="block text-sm font-medium text-gray-700"
          >
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration_minutes"
            value={formData.duration_minutes}
            onChange={(e) =>
              setFormData({ ...formData, duration_minutes: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            min="0"
          />
        </div>

        <div>
          <label
            htmlFor="resolution"
            className="block text-sm font-medium text-gray-700"
          >
            Resolution
          </label>
          <textarea
            id="resolution"
            value={formData.resolution}
            onChange={(e) =>
              setFormData({ ...formData, resolution: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>

        <div>
          <label
            htmlFor="outcome"
            className="block text-sm font-medium text-gray-700"
          >
            Outcome
          </label>
          <select
            id="outcome"
            value={formData.outcome}
            onChange={(e) =>
              setFormData({ ...formData, outcome: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          >
            <option value="">Select outcome</option>
            {OUTCOMES.map((outcome) => (
              <option key={outcome} value={outcome}>
                {outcome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading ? 'Saving...' : entry ? 'Update Entry' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
}
