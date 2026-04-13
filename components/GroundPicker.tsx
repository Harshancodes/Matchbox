'use client';

import { CourtType } from '@/lib/types';

interface Props {
  selected: CourtType | null;
  onChange: (c: CourtType) => void;
}

export default function GroundPicker({ selected, onChange }: Props) {
  const leftSelected = selected === 'left_half' || selected === 'full';
  const rightSelected = selected === 'right_half' || selected === 'full';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center">Tap a half to select it, or tap <strong>Full Court</strong> below</p>

      {/* Aerial ground SVG */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 420 240"
          className="w-full max-w-lg rounded-2xl shadow-lg border-4 border-green-800"
          style={{ background: 'linear-gradient(135deg, #2d6a2d 25%, #357a35 50%, #2d6a2d 75%)' }}
        >
          {/* Grass texture stripes */}
          {[0,1,2,3,4,5,6,7].map(i => (
            <rect key={i} x={i*60} y="0" width="30" height="240" fill="rgba(0,0,0,0.04)" />
          ))}

          {/* LEFT HALF clickable zone */}
          <rect
            x="0" y="0" width="210" height="240"
            fill={selected === 'left_half' ? 'rgba(34,197,94,0.45)' : selected === 'full' ? 'rgba(34,197,94,0.35)' : 'rgba(0,0,0,0)'}
            className="cursor-pointer transition-all"
            onClick={() => onChange(selected === 'left_half' ? 'full' : 'left_half')}
          />
          {/* RIGHT HALF clickable zone */}
          <rect
            x="210" y="0" width="210" height="240"
            fill={selected === 'right_half' ? 'rgba(34,197,94,0.45)' : selected === 'full' ? 'rgba(34,197,94,0.35)' : 'rgba(0,0,0,0)'}
            className="cursor-pointer transition-all"
            onClick={() => onChange(selected === 'right_half' ? 'full' : 'right_half')}
          />

          {/* Outer boundary */}
          <rect x="8" y="8" width="404" height="224" rx="4" fill="none" stroke="white" strokeWidth="3" />

          {/* Center line */}
          <line x1="210" y1="8" x2="210" y2="232" stroke="white" strokeWidth="2.5" />

          {/* Center circle */}
          <circle cx="210" cy="120" r="36" fill="none" stroke="white" strokeWidth="2.5" />
          {/* Center dot */}
          <circle cx="210" cy="120" r="4" fill="white" />

          {/* LEFT penalty box */}
          <rect x="8" y="72" width="60" height="96" fill="none" stroke="white" strokeWidth="2" />
          {/* LEFT goal box */}
          <rect x="8" y="94" width="28" height="52" fill="none" stroke="white" strokeWidth="2" />
          {/* LEFT goal */}
          <rect x="2" y="102" width="8" height="36" rx="2" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5" />
          {/* LEFT penalty spot */}
          <circle cx="88" cy="120" r="3" fill="white" />
          {/* LEFT penalty arc */}
          <path d="M68 90 A36 36 0 0 1 68 150" fill="none" stroke="white" strokeWidth="2" />
          {/* LEFT corner arcs */}
          <path d="M8 16 A12 12 0 0 1 20 8" fill="none" stroke="white" strokeWidth="2" />
          <path d="M8 224 A12 12 0 0 0 20 232" fill="none" stroke="white" strokeWidth="2" />

          {/* RIGHT penalty box */}
          <rect x="352" y="72" width="60" height="96" fill="none" stroke="white" strokeWidth="2" />
          {/* RIGHT goal box */}
          <rect x="384" y="94" width="28" height="52" fill="none" stroke="white" strokeWidth="2" />
          {/* RIGHT goal */}
          <rect x="410" y="102" width="8" height="36" rx="2" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5" />
          {/* RIGHT penalty spot */}
          <circle cx="332" cy="120" r="3" fill="white" />
          {/* RIGHT penalty arc */}
          <path d="M352 90 A36 36 0 0 0 352 150" fill="none" stroke="white" strokeWidth="2" />
          {/* RIGHT corner arcs */}
          <path d="M412 16 A12 12 0 0 0 400 8" fill="none" stroke="white" strokeWidth="2" />
          <path d="M412 224 A12 12 0 0 1 400 232" fill="none" stroke="white" strokeWidth="2" />

          {/* Half labels */}
          <text x="105" y="128" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" opacity="0.85">LEFT HALF</text>
          <text x="315" y="128" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" opacity="0.85">RIGHT HALF</text>

          {/* Selection highlight border */}
          {selected === 'left_half' && (
            <rect x="8" y="8" width="202" height="224" rx="3" fill="none" stroke="#4ade80" strokeWidth="3" strokeDasharray="8 4" />
          )}
          {selected === 'right_half' && (
            <rect x="210" y="8" width="202" height="224" rx="3" fill="none" stroke="#4ade80" strokeWidth="3" strokeDasharray="8 4" />
          )}
          {selected === 'full' && (
            <rect x="8" y="8" width="404" height="224" rx="4" fill="none" stroke="#4ade80" strokeWidth="4" strokeDasharray="10 4" />
          )}

          {/* Tap hint arrows */}
          {!selected && (
            <>
              <text x="105" y="148" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11">tap to select</text>
              <text x="315" y="148" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11">tap to select</text>
            </>
          )}
        </svg>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {(['left_half', 'right_half', 'full'] as CourtType[]).map((ct) => {
          const labels: Record<string, string> = { left_half: '⬅ Left Half', right_half: 'Right Half ➡', full: '⛳ Full Court' };
          return (
            <button
              key={ct}
              onClick={() => onChange(ct)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer ${
                selected === ct
                  ? 'bg-green-600 border-green-600 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-green-400'
              }`}
            >
              {labels[ct]}
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="text-center text-sm text-green-700 font-medium">
          {selected === 'left_half' && 'Left half selected'}
          {selected === 'right_half' && 'Right half selected'}
          {selected === 'full' && 'Full court selected'}
        </p>
      )}
    </div>
  );
}
