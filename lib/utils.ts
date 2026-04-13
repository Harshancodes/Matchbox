// Generate a short random booking ID like "A3F9"
export function generateBookingId(): string {
  return Math.random().toString(36).toUpperCase().slice(2, 6);
}

// "2026-04-15" → "15 April 2026"
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// "06:00:00" or "06:00" → "6:00 AM"
export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// Returns array of time slot values from 6:00 AM to 9:30 PM in 30-min steps
export function generateTimeSlots(): { label: string; value: string }[] {
  const slots = [];
  for (let h = 6; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) break;
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const label = formatTime(`${h}:${m}`);
      slots.push({ value, label });
    }
  }
  return slots;
}

// Duration options in hours
export const DURATION_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4];

// Add hours to a time string "HH:MM" → "HH:MM"
export function addHours(timeStr: string, hours: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m + hours * 60;
  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

// "HH:MM" → minutes since midnight
export function timeToMins(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Returns next 14 days as YYYY-MM-DD strings
export function getNext14Days(): string[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// "YYYY-MM-DD" → "Mon, 15 Apr"
export function formatDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
