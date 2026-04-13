export type BookingCategory = 'ground' | 'pickleball';

export type Location = 'vijaynagar' | 'hebbal';

// Ground court type: full, left half, right half
// Pickleball: court_1 through court_4
export type CourtType = 'full' | 'left_half' | 'right_half' | 'court_1' | 'court_2' | 'court_3' | 'court_4';

export interface Booking {
  id: string;
  booking_id: string;
  category: BookingCategory;
  location: Location;
  court_type: CourtType;
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
  category: BookingCategory;
  location: Location;
  court_type: CourtType;
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
