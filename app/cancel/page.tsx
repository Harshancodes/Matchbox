'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatDate, formatTime } from '@/lib/utils';
import { Booking } from '@/lib/types';

const COURT_LABELS: Record<string, string> = {
  full: 'Full Court', left_half: 'Left Half', right_half: 'Right Half',
  court_1: 'Court 1', court_2: 'Court 2', court_3: 'Court 3', court_4: 'Court 4',
};

function CancelPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [bookingId, setBookingId] = useState(params.get('id')?.toUpperCase() ?? '');
  const [phone, setPhone] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId.trim() || !/^\d{10}$/.test(phone)) {
      setLookupError('Enter a valid Booking ID and 10-digit phone number.');
      return;
    }
    setLookupError('');
    setLookupLoading(true);
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok || !data.booking) {
        setLookupError('Booking not found. Check your Booking ID.');
      } else if (data.booking.phone !== phone.trim()) {
        setLookupError('Phone number does not match this booking.');
      } else {
        setBooking(data.booking);
      }
    } catch {
      setLookupError('Network error. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.booking_id, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setCancelled(true);
      } else {
        setCancelError(data.error ?? 'Cancellation failed.');
      }
    } catch {
      setCancelError('Network error. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  }

  if (cancelled) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-10">
        <div className="text-5xl">❌</div>
        <h2 className="text-2xl font-bold text-gray-800">Booking Cancelled</h2>
        <p className="text-gray-500 text-sm">Your booking <span className="font-mono font-semibold">#{bookingId}</span> has been cancelled. The slot is now free for others.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-3 rounded-full bg-green-600 text-white font-semibold text-sm hover:bg-green-700 cursor-pointer"
        >
          Book a new slot
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">&larr; Back</button>
        <h2 className="text-xl font-bold text-gray-800 mt-2">Cancel a Booking</h2>
        <p className="text-gray-500 text-sm mt-1">Cancellations must be made at least <strong>6 hours</strong> before your slot.</p>
      </div>

      {/* Lookup form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value.toUpperCase())}
              placeholder="e.g. A3F9"
              maxLength={6}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 font-mono uppercase"
            />
            <p className="text-xs text-gray-400 mt-1">Found on your confirmation page or WhatsApp notification</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number used when booking"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {lookupError && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{lookupError}</p>
          )}

          <button
            type="submit"
            disabled={lookupLoading}
            className={`w-full py-3 rounded-full font-semibold text-white text-sm transition-all ${
              lookupLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'
            }`}
          >
            {lookupLoading ? 'Looking up...' : 'Find My Booking'}
          </button>
        </form>
      </div>

      {/* Booking preview + cancel */}
      {booking && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-700">Your Booking</h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Type</p>
              <p className="font-medium capitalize">{booking.category === 'pickleball' ? '🏓 Pickleball' : '🏟️ Ground'} — {COURT_LABELS[booking.court_type]}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Location</p>
              <p className="font-medium capitalize">📍 {booking.location}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Date</p>
              <p className="font-medium">{formatDate(booking.date)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Time</p>
              <p className="font-medium">{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Name</p>
              <p className="font-medium">{booking.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Duration</p>
              <p className="font-medium">{booking.duration_hours}h</p>
            </div>
          </div>

          {booking.status === 'cancelled' ? (
            <p className="text-center text-sm text-red-500 font-medium">This booking is already cancelled.</p>
          ) : (
            <>
              {cancelError && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{cancelError}</p>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                ⚠️ This cannot be undone. Cancellations are only allowed <strong>6+ hours before</strong> the slot.
              </div>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className={`w-full py-3 rounded-full font-semibold text-white text-sm transition-all ${
                  cancelLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 cursor-pointer'
                }`}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel This Booking'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function CancelPageWrapper() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-10">Loading...</p>}>
      <CancelPage />
    </Suspense>
  );
}
