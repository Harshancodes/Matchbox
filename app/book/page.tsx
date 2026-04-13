'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import DatePicker from '@/components/DatePicker';
import TimeRangePicker from '@/components/TimeRangePicker';
import AvailabilityTimeline from '@/components/AvailabilityTimeline';
import BookingForm from '@/components/BookingForm';
import { BookingCategory, Location, CourtType, Booking, BlockedSlot } from '@/lib/types';
import { addHours, formatDate, formatTime } from '@/lib/utils';

const COURT_LABELS: Record<string, string> = {
  full: 'Full Court',
  left_half: 'Left Half',
  right_half: 'Right Half',
  court_1: 'Court 1',
  court_2: 'Court 2',
  court_3: 'Court 3',
  court_4: 'Court 4',
};

function BookPage() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get('category') as BookingCategory | null;
  const location = params.get('location') as Location | null;
  const courtType = params.get('court') as CourtType | null;

  const [date, setDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [overlap, setOverlap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  useEffect(() => {
    if (!category || !location || !courtType) router.replace('/');
  }, [category, location, courtType, router]);

  const fetchSlots = useCallback(async () => {
    if (!category || !location || !courtType || !date) return;
    setFetchingSlots(true);
    try {
      const res = await fetch(`/api/bookings?category=${category}&location=${location}&court=${courtType}&date=${date}`);
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setBlockedSlots(data.blockedSlots ?? []);
    } catch {
      // non-critical
    } finally {
      setFetchingSlots(false);
    }
  }, [category, location, courtType, date]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  useEffect(() => {
    if (!startTime || !duration) { setOverlap(false); return; }
    const newStart = toMins(startTime);
    const newEnd = newStart + duration * 60;

    const allSlots = [
      ...bookings.filter((b) => b.status === 'confirmed').map((b) => ({
        start: toMins(b.start_time.slice(0, 5)),
        end: toMins(b.end_time.slice(0, 5)),
      })),
      ...blockedSlots.map((bl) => ({
        start: toMins(bl.start_time.slice(0, 5)),
        end: toMins(bl.end_time.slice(0, 5)),
      })),
    ];

    setOverlap(allSlots.some((s) => newStart < s.end && newEnd > s.start));
  }, [startTime, duration, bookings, blockedSlots]);

  function toMins(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  async function handleSubmit(name: string, phone: string) {
    if (!category || !location || !courtType || !date || !startTime || !duration) return;
    setLoading(true);
    try {
      const endTime = addHours(startTime, duration);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, location, court_type: courtType, date, start_time: startTime, end_time: endTime, duration_hours: duration, name, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/confirmation?id=${data.booking_id}`);
      } else {
        alert(data.error ?? 'Booking failed. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const courtLabel = courtType ? COURT_LABELS[courtType] : '';
  const locationLabel = location ? location.charAt(0).toUpperCase() + location.slice(1) : '';
  const endTime = startTime && duration ? addHours(startTime, duration) : null;
  const canSubmit = !!date && !!startTime && !!duration && !overlap;

  const pageTitle = category === 'pickleball'
    ? `Pickleball — ${courtLabel}`
    : `Ground — ${courtLabel} · ${locationLabel}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">&larr; Back</button>
        <h2 className="text-lg font-bold text-gray-800">{pageTitle}</h2>
      </div>

      {/* Booking summary chip */}
      <div className="flex flex-wrap gap-2">
        <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
          {category === 'pickleball' ? '🏓 Pickleball' : '🏟️ Ground'}
        </span>
        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
          📍 {locationLabel}
        </span>
        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
          {courtLabel}
        </span>
      </div>

      {/* Step 1: Date */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">1. Choose Date</h3>
        <DatePicker selected={date} onChange={(d) => { setDate(d); setStartTime(null); setDuration(null); }} />
      </section>

      {/* Availability timeline */}
      {date && (
        <div>
          {fetchingSlots ? (
            <p className="text-sm text-gray-400 text-center py-2">Loading availability...</p>
          ) : (
            <AvailabilityTimeline
              bookings={bookings}
              blockedSlots={blockedSlots}
              selectedStart={startTime}
              selectedDuration={duration}
            />
          )}
        </div>
      )}

      {/* Step 2: Time */}
      {date && (
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">2. Choose Time &amp; Duration</h3>
          <TimeRangePicker
            startTime={startTime}
            duration={duration}
            onStartChange={(t) => setStartTime(t)}
            onDurationChange={(d) => setDuration(d)}
          />
          {overlap && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              This slot overlaps with an existing booking. Please choose a different time.
            </div>
          )}
        </section>
      )}

      {/* Summary */}
      {date && startTime && duration && !overlap && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800 space-y-1">
          <p className="font-semibold text-green-700 mb-1">Booking Summary</p>
          <p><span className="text-green-600">Type:</span> {pageTitle}</p>
          <p><span className="text-green-600">Date:</span> {formatDate(date)}</p>
          <p><span className="text-green-600">Time:</span> {formatTime(startTime)} – {endTime ? formatTime(endTime + ':00') : ''}</p>
          <p><span className="text-green-600">Duration:</span> {duration} hour{duration !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Step 3: Contact */}
      {canSubmit && (
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">3. Your Details</h3>
          <BookingForm onSubmit={handleSubmit} loading={loading} />
        </section>
      )}
    </div>
  );
}

export default function BookPageWrapper() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-10">Loading...</p>}>
      <BookPage />
    </Suspense>
  );
}
