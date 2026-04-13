'use client';

import { getNext14Days, formatDayLabel } from '@/lib/utils';

interface Props {
  selected: string | null;
  onChange: (date: string) => void;
}

export default function DatePicker({ selected, onChange }: Props) {
  const days = getNext14Days();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
      {days.map((date) => {
        const isToday = date === days[0];
        const isSelected = selected === date;
        return (
          <button
            key={date}
            onClick={() => onChange(date)}
            className={`flex-shrink-0 snap-start rounded-xl px-3 py-2 text-sm font-medium border-2 transition-all cursor-pointer ${
              isSelected
                ? 'bg-green-600 border-green-600 text-white shadow'
                : 'bg-white border-gray-200 text-gray-700 hover:border-green-400'
            }`}
          >
            <div className="text-xs opacity-75">{isToday ? 'Today' : formatDayLabel(date).split(',')[0]}</div>
            <div className="font-semibold">{formatDayLabel(date).replace(/^\w+,\s*/, '')}</div>
          </button>
        );
      })}
    </div>
  );
}
