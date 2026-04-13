'use client';

import { useEffect, useState } from 'react';
import { getNext14Days, formatDayLabel, timeToMins } from '@/lib/utils';
import { BookingCategory, Location, CourtType } from '@/lib/types';

// Availability status for a single day
type DayStatus = 'free' | 'partial' | 'full';

interface Props {
  selected: string | null;
  onChange: (date: string) => void;
  category: BookingCategory;
  location: Location;
  courtType: CourtType;
}

const DAY_START_MINS = 6 * 60;       // 6:00 AM
const DAY_END_MINS = 21 * 60 + 30;   // 9:30 PM
const TOTAL_MINS = DAY_END_MINS - DAY_START_MINS; // 930 mins

function computeStatus(bookedMins: number): DayStatus {
  if (bookedMins === 0) return 'free';
  if (bookedMins >= TOTAL_MINS) return 'full';
  return 'partial';
}

const STATUS_BADGE: Record<DayStatus, { label: string; dot: string }> = {
  free:    { label: 'Free',    dot: 'bg-green-400' },
  partial: { label: 'Partial', dot: 'bg-yellow-400' },
  full:    { label: 'Full',    dot: 'bg-red-400' },
};

export default function DatePicker({ selected, onChange, category, location, courtType }: Props) {
  const days = getNext14Days();
  const [statusMap, setStatusMap] = useState<Record<string, DayStatus>>({});

  useEffect(() => {
    // Fetch availability for all 14 days in parallel
    async function load() {
      const results = await Promise.allSettled(
        days.map((date) =>
          fetch(`/api/bookings?category=${category}&location=${location}&court=${courtType}&date=${date}`)
            .then((r) => r.json())
            .then((data) => ({ date, data }))
        )
      );

      const map: Record<string, DayStatus> = {};
      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        const { date, data } = r.value;
        const bookings = (data.bookings ?? []) as { start_time: string; end_time: string }[];
        const blocked = (data.blockedSlots ?? []) as { start_time: string; end_time: string }[];

        // Sum up booked + blocked minutes for this day
        let bookedMins = 0;
        for (const slot of [...bookings, ...blocked]) {
          const s = Math.max(timeToMins(slot.start_time.slice(0, 5)), DAY_START_MINS);
          const e = Math.min(timeToMins(slot.end_time.slice(0, 5)), DAY_END_MINS);
          if (e > s) bookedMins += e - s;
        }
        map[date] = computeStatus(Math.min(bookedMins, TOTAL_MINS));
      }
      setStatusMap(map);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, location, courtType]);

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex gap-3 text-xs text-gray-500">
        {(['free', 'partial', 'full'] as DayStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full inline-block ${STATUS_BADGE[s].dot}`} />
            {STATUS_BADGE[s].label}
          </span>
        ))}
      </div>

      {/* Date scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
        {days.map((date) => {
          const isToday = date === days[0];
          const isSelected = selected === date;
          const status = statusMap[date];
          const isFull = status === 'full';

          return (
            <button
              key={date}
              onClick={() => !isFull && onChange(date)}
              disabled={isFull}
              className={`flex-shrink-0 snap-start rounded-xl px-3 py-2 text-sm font-medium border-2 transition-all min-w-[64px] text-center ${
                isSelected
                  ? 'bg-green-600 border-green-600 text-white shadow'
                  : isFull
                  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-green-400 cursor-pointer'
              }`}
            >
              <div className="text-xs opacity-75 mb-0.5">{isToday ? 'Today' : formatDayLabel(date).split(',')[0]}</div>
              <div className="font-semibold text-xs leading-tight">{formatDayLabel(date).replace(/^\w+,\s*/, '')}</div>

              {/* Availability dot */}
              {status && !isSelected && (
                <div className="flex justify-center mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_BADGE[status].dot}`} />
                </div>
              )}
              {isSelected && status && (
                <div className="text-[9px] mt-0.5 opacity-80">{STATUS_BADGE[status].label}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
