import { Booking } from './types';
import { formatDate, formatTime } from './utils';

export async function notifyTeam(booking: Booking): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.warn('CallMeBot env vars not set — skipping WhatsApp notification');
    return;
  }

  const sportLabel = booking.sport.charAt(0).toUpperCase() + booking.sport.slice(1);
  const message = [
    '🏟️ New Ground Booking!',
    '',
    `Sport     : ${sportLabel}`,
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
