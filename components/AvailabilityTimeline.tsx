'use client';

import { Booking, BlockedSlot } from '@/lib/types';
import { timeToMins, formatTime } from '@/lib/utils';

interface Props {
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
  selectedStart?: string | null;
  selectedDuration?: number | null;
}

const DAY_START = 6 * 60;   // 6:00 AM in minutes
const DAY_END = 21 * 60 + 30; // 9:30 PM in minutes
const DAY_SPAN = DAY_END - DAY_START;

function pct(mins: number) {
  return ((mins - DAY_START) / DAY_SPAN) * 100;
}

const HOUR_MARKS = [6, 8, 10, 12, 14, 16, 18, 20];

export default function AvailabilityTimeline({ bookings, blockedSlots, selectedStart, selectedDuration }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-3">Timeline (6 AM – 9:30 PM)</p>
      <div className="relative h-10 bg-green-50 rounded-lg overflow-hidden border border-gray-200">
        {/* Hour markers */}
        {HOUR_MARKS.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-gray-200"
            style={{ left: `${pct(h * 60)}%` }}
          >
            <span className="absolute bottom-1 left-0.5 text-[9px] text-gray-400">{h > 12 ? h - 12 : h}{h >= 12 ? 'PM' : 'AM'}</span>
          </div>
        ))}

        {/* Booked blocks */}
        {bookings
          .filter((b) => b.status === 'confirmed')
          .map((b) => {
            const start = timeToMins(b.start_time.slice(0, 5));
            const end = timeToMins(b.end_time.slice(0, 5));
            return (
              <div
                key={b.id}
                title={`${b.name} — ${formatTime(b.start_time)} to ${formatTime(b.end_time)}`}
                className="absolute top-1 bottom-1 bg-red-400 rounded opacity-80"
                style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
              />
            );
          })}

        {/* Blocked slots */}
        {blockedSlots.map((bl) => {
          const start = timeToMins(bl.start_time.slice(0, 5));
          const end = timeToMins(bl.end_time.slice(0, 5));
          return (
            <div
              key={bl.id}
              title={`Blocked: ${bl.reason}`}
              className="absolute top-1 bottom-1 bg-gray-400 rounded opacity-70"
              style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
            />
          );
        })}

        {/* Selected slot preview */}
        {selectedStart && selectedDuration && (() => {
          const start = timeToMins(selectedStart);
          const end = start + selectedDuration * 60;
          return (
            <div
              className="absolute top-1 bottom-1 bg-green-500 rounded opacity-80 border-2 border-green-700"
              style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
            />
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Booked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-400 inline-block" /> Blocked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Your slot</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 border border-gray-200 inline-block" /> Free</span>
      </div>
    </div>
  );
}
