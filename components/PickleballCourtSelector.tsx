'use client';

import { CourtType } from '@/lib/types';

interface Props {
  selected: CourtType | null;
  onChange: (c: CourtType) => void;
}

const COURTS: { id: CourtType; label: string }[] = [
  { id: 'court_1', label: 'Court 1' },
  { id: 'court_2', label: 'Court 2' },
  { id: 'court_3', label: 'Court 3' },
  { id: 'court_4', label: 'Court 4' },
];

function PickleballCourtSVG({ courtId, isSelected, onClick }: { courtId: string; isSelected: boolean; onClick: () => void }) {
  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Court background */}
      <rect
        x="1" y="1" width="88" height="118"
        rx="3"
        fill={isSelected ? '#166534' : '#15803d'}
        stroke={isSelected ? '#4ade80' : '#14532d'}
        strokeWidth={isSelected ? '3' : '1.5'}
      />
      {/* Outer boundary */}
      <rect x="7" y="7" width="76" height="106" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Non-volley zone (kitchen) - top */}
      <rect x="7" y="7" width="76" height="26" fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="1" />
      {/* Non-volley zone (kitchen) - bottom */}
      <rect x="7" y="87" width="76" height="26" fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="1" />
      {/* Center line */}
      <line x1="45" y1="33" x2="45" y2="87" stroke="white" strokeWidth="1.2" />
      {/* Net line */}
      <line x1="7" y1="60" x2="83" y2="60" stroke="white" strokeWidth="2.5" strokeDasharray="4 2" />
      {/* NVZ label */}
      <text x="45" y="23" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="7">NVZ</text>
      <text x="45" y="100" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="7">NVZ</text>
      {/* Court number */}
      <text x="45" y="57" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{courtId.replace('court_', 'C')}</text>
      {/* Selection tick */}
      {isSelected && (
        <circle cx="80" cy="12" r="7" fill="#4ade80" />
      )}
      {isSelected && (
        <text x="80" y="16" textAnchor="middle" fill="#14532d" fontSize="9" fontWeight="bold">✓</text>
      )}
    </g>
  );
}

export default function PickleballCourtSelector({ selected, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">4 courts available at Hebbal — tap to select</p>

      <div className="flex justify-center">
        <svg
          viewBox="0 0 400 150"
          className="w-full max-w-lg rounded-2xl shadow-lg border-4 border-green-900"
          style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)' }}
        >
          {/* Venue label */}
          <text x="200" y="14" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" letterSpacing="2">HEBBAL PICKLEBALL CENTRE</text>

          {/* 4 courts side by side */}
          {COURTS.map((c, i) => (
            <g key={c.id} transform={`translate(${10 + i * 97}, 18)`}>
              <PickleballCourtSVG
                courtId={c.id}
                isSelected={selected === c.id}
                onClick={() => onChange(c.id)}
              />
            </g>
          ))}

          {/* Net label */}
          <text x="200" y="82" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">— NET —</text>
        </svg>
      </div>

      {/* Court buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {COURTS.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer ${
              selected === c.id
                ? 'bg-green-600 border-green-600 text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-700 hover:border-green-400'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {selected && (
        <p className="text-center text-sm text-green-700 font-medium">
          {selected.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} selected at Hebbal
        </p>
      )}
    </div>
  );
}
