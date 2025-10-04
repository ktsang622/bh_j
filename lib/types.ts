export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface Kid {
  id: number;
  name: string;
}

export interface BehaviourEntry {
  id: number;
  kid_id: number;
  user_id: number;
  event_date: string;
  trigger: string | null;
  behaviour: string | null;
  intensity: string | null;
  duration_minutes: number | null;
  resolution: string | null;
  outcome: string | null;
  notes: string | null;
  created_at: string;
}

export const TRIGGERS = [
  'Transition',
  'Denied Request',
  'Sensory/Noise',
  'Peer Conflict',
  'Other'
] as const;

export const BEHAVIOURS = [
  'Crying',
  'Shouting',
  'Aggression',
  'Hiding',
  'Refusal/Silence',
  'Other'
] as const;

export const INTENSITIES = ['Low', 'Medium', 'High'] as const;

export const OUTCOMES = ['Resolved', 'Partially', 'Not Resolved'] as const;
