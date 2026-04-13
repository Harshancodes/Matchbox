'use client';

import { generateTimeSlots, DURATION_OPTIONS, addHours, timeToMins } from '@/lib/utils';

interface Props {
  startTime: string | null;
  duration: number | null;
  onStartChange: (t: string) => void;
  onDurationChange: (d: number) => void;
}

const MAX_END_MINS = 21 * 60 + 30; // 9:30 PM

export default function TimeRangePicker({ startTime, duration, onStartChange, onDurationChange }: Props) {
  const slots = generateTimeSlots();

  function isStartValid(value: string, dur: number): boolean {
    const endMins = timeToMins(addHours(value, dur));
    return endMins <= MAX_END_MINS;
  }

  return (
    <div className="space-y-4">
      {/* Start time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {slots.map((slot) => {
            const wouldFit = duration ? isStartValid(slot.value, duration) : true;
            const isSelected = startTime === slot.value;
            return (
              <button
                key={slot.value}
                onClick={() => onStartChange(slot.value)}
                disabled={!wouldFit}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-green-600 border-green-600 text-white shadow'
                    : wouldFit
                    ? 'bg-white border-gray-200 text-gray-700 hover:border-green-400'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((d) => {
            const fits = startTime ? isStartValid(startTime, d) : true;
            const isSelected = duration === d;
            return (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                disabled={!fits}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-green-600 border-green-600 text-white shadow'
                    : fits
                    ? 'bg-white border-gray-200 text-gray-700 hover:border-green-400'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {d}h
              </button>
            );
          })}
        </div>
      </div>

      {/* End time preview */}
      {startTime && duration && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
          <span className="font-medium">End time:</span>{' '}
          {(() => {
            const end = addHours(startTime, duration);
            const [h, m] = end.split(':').map(Number);
            const p = h >= 12 ? 'PM' : 'AM';
            const hr = h % 12 === 0 ? 12 : h % 12;
            return `${hr}:${m.toString().padStart(2, '0')} ${p}`;
          })()}
        </div>
      )}
    </div>
  );
}
