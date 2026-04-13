'use client';

import { Sport } from '@/lib/types';

const SPORTS: { id: Sport; label: string; emoji: string; desc: string }[] = [
  { id: 'cricket', label: 'Cricket', emoji: '🏏', desc: 'Full ground with pitch' },
  { id: 'football', label: 'Football', emoji: '⚽', desc: 'Full-size grass field' },
  { id: 'badminton', label: 'Badminton', emoji: '🏸', desc: 'Indoor court' },
];

interface Props {
  selected: Sport | null;
  onChange: (sport: Sport) => void;
}

export default function SportSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {SPORTS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`rounded-2xl border-2 p-5 text-left transition-all shadow-sm hover:shadow-md cursor-pointer ${
            selected === s.id
              ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
              : 'border-gray-200 bg-white hover:border-green-400'
          }`}
        >
          <div className="text-4xl mb-2">{s.emoji}</div>
          <div className="font-semibold text-gray-800 text-lg">{s.label}</div>
          <div className="text-gray-500 text-sm mt-1">{s.desc}</div>
        </button>
      ))}
    </div>
  );
}
