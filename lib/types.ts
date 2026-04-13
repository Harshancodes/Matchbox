export type Sport = 'cricket' | 'football' | 'badminton';

export interface Booking {
  id: string;
  booking_id: string;
  sport: Sport;
  date: string;           // YYYY-MM-DD
  start_time: string;     // HH:MM:SS
  end_time: string;       // HH:MM:SS
  duration_hours: number;
  name: string;
  phone: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface BlockedSlot {
  id: string;
  sport: Sport;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_at: string;
}

export interface TimeSlot {
  label: string;   // "6:00 AM"
  value: string;   // "06:00"
}
