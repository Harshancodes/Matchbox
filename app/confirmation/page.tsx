'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Booking } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';

function ConfirmationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get('id');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { router.replace('/'); return; }
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => setBooking(d.booking))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId, router]);

  function buildCalendarUrl(b: Booking) {
    const COURT_LABELS: Record<string, string> = { full: 'Full Court', left_half: 'Left Half', right_half: 'Right Half', court_1: 'Court 1', court_2: 'Court 2', court_3: 'Court 3', court_4: 'Court 4' };
    const typeLabel = b.category === 'pickleball' ? 'Pickleball' : `Ground — ${COURT_LABELS[b.court_type] ?? b.court_type}`;
    const locationLabel = b.location.charAt(0).toUpperCase() + b.location.slice(1);
    const [yr, mo, dy] = b.date.split('-').map(Number);
    const [sh, sm] = b.start_time.split(':').map(Number);
    const [eh, em] = b.end_time.split(':').map(Number);

    function pad(n: number) { return n.toString().padStart(2, '0'); }
    const start = `${yr}${pad(mo)}${pad(dy)}T${pad(sh)}${pad(sm)}00`;
    const end = `${yr}${pad(mo)}${pad(dy)}T${pad(eh)}${pad(em)}00`;

    const title = encodeURIComponent(`${typeLabel} at Matchbox ${locationLabel}`);
    const details = encodeURIComponent(`Booking ID: #${b.booking_id}\nPhone: ${b.phone}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
  }

  if (loading) return <p className="text-center text-gray-400 py-16">Loading...</p>;

  if (!booking) return (
    <div className="text-center py-16">
      <p className="text-gray-500">Booking not found.</p>
      <button onClick={() => router.push('/')} className="mt-4 text-green-600 underline cursor-pointer">Go home</button>
    </div>
  );

  const COURT_LABELS: Record<string, string> = { full: 'Full Court', left_half: 'Left Half', right_half: 'Right Half', court_1: 'Court 1', court_2: 'Court 2', court_3: 'Court 3', court_4: 'Court 4' };
  const typeLabel = booking.category === 'pickleball' ? 'Pickleball' : 'Ground';
  const courtLabel = COURT_LABELS[booking.court_type] ?? booking.court_type;
  const locationLabel = booking.location.charAt(0).toUpperCase() + booking.location.slice(1);
  const emoji = booking.category === 'pickleball' ? '🏓' : '🏟️';

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Success banner */}
      <div className="text-center py-6">
        <div className="text-5xl mb-3">✅</div>
        <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-1 text-sm">The ground team has been notified on WhatsApp</p>
      </div>

      {/* Booking details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl">{emoji}</span>
          <div>
            <p className="font-bold text-gray-800 text-lg">{typeLabel} — {courtLabel}</p>
            <p className="text-xs text-gray-500">📍 {locationLabel}</p>
            <p className="text-xs text-gray-400 font-mono">Booking #{booking.booking_id}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Date</p>
            <p className="font-medium text-gray-800">{formatDate(booking.date)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Duration</p>
            <p className="font-medium text-gray-800">{booking.duration_hours}h</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Start</p>
            <p className="font-medium text-gray-800">{formatTime(booking.start_time)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">End</p>
            <p className="font-medium text-gray-800">{formatTime(booking.end_time)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Name</p>
            <p className="font-medium text-gray-800">{booking.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Phone</p>
            <p className="font-medium text-gray-800">{booking.phone}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <a
          href={buildCalendarUrl(booking)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center py-3 rounded-full border-2 border-green-600 text-green-700 font-semibold text-sm hover:bg-green-50 transition-all"
        >
          📅 Add to Google Calendar
        </a>
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 rounded-full bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all cursor-pointer"
        >
          Book Another Slot
        </button>
        <button
          onClick={() => router.push(`/cancel?id=${booking.booking_id}`)}
          className="w-full py-3 rounded-full border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-all cursor-pointer"
        >
          Cancel This Booking
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 text-center">
        Ground contact: <strong>+91 XXXXX XXXXX</strong>
      </div>
    </div>
  );
}

export default function ConfirmationWrapper() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-10">Loading...</p>}>
      <ConfirmationPage />
    </Suspense>
  );
}
