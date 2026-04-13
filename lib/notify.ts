import { Booking } from './types';
import { formatDate, formatTime } from './utils';

const COURT_LABELS: Record<string, string> = {
  full: 'Full Court',
  left_half: 'Left Half',
  right_half: 'Right Half',
  court_1: 'Court 1',
  court_2: 'Court 2',
  court_3: 'Court 3',
  court_4: 'Court 4',
};

export async function notifyTeam(booking: Booking): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.warn('CallMeBot env vars not set — skipping WhatsApp notification');
    return;
  }

  const emoji = booking.category === 'pickleball' ? '🏓' : '🏟️';
  const typeLabel = booking.category === 'pickleball' ? 'Pickleball' : 'Ground';
  const locationLabel = booking.location.charAt(0).toUpperCase() + booking.location.slice(1);
  const courtLabel = COURT_LABELS[booking.court_type] ?? booking.court_type;

  const message = [
    `${emoji} New ${typeLabel} Booking!`,
    '',
    `Type      : ${typeLabel} — ${courtLabel}`,
    `Location  : ${locationLabel}`,
    `Date      : ${formatDate(booking.date)}`,
    `Start     : ${formatTime(booking.start_time)}`,
    `End       : ${formatTime(booking.end_time)}`,
    `Duration  : ${booking.duration_hours} hour${booking.duration_hours !== 1 ? 's' : ''}`,
    `Name      : ${booking.name}`,
    `Phone     : ${booking.phone}`,
    `Booking ID: #${booking.booking_id}`,
    '',
    `View bookings: ${process.env.NEXT_PUBLIC_APP_URL}/admin`,
  ].join('\n');

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apikey}`;

  try {
    await fetch(url);
  } catch (err) {
    console.error('Failed to send WhatsApp notification:', err);
  }
}
