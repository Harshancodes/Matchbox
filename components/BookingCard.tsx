'use client';

import { Booking } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/utils';

interface Props {
  booking: Booking;
  onCancel?: (id: string) => void;
  showCancel?: boolean;
}

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  badminton: '🏸',
};

export default function BookingCard({ booking, onCancel, showCancel }: Props) {
  const isCancelled = booking.status === 'cancelled';

  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm ${isCancelled ? 'opacity-50' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{SPORT_EMOJI[booking.sport]}</span>
          <div>
            <p className="font-semibold text-gray-800 capitalize">{booking.sport}</p>
            <p className="text-xs text-gray-500">{formatDate(booking.date)}</p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            isCancelled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
          }`}
        >
          {isCancelled ? 'Cancelled' : 'Confirmed'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
        <div><span className="text-gray-400 text-xs">Time</span><br />{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</div>
        <div><span className="text-gray-400 text-xs">Duration</span><br />{booking.duration_hours}h</div>
        <div><span className="text-gray-400 text-xs">Name</span><br />{booking.name}</div>
        <div><span className="text-gray-400 text-xs">Phone</span><br />{booking.phone}</div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">#{booking.booking_id}</span>
        {showCancel && !isCancelled && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
