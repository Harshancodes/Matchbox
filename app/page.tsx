'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GroundPicker from '@/components/GroundPicker';
import PickleballCourtSelector from '@/components/PickleballCourtSelector';
import { BookingCategory, Location, CourtType } from '@/lib/types';

const LOCATIONS: { id: Location; label: string; emoji: string; desc: string }[] = [
  { id: 'vijaynagar', label: 'Vijaynagar', emoji: '📍', desc: 'Football + Cricket ground' },
  { id: 'hebbal',     label: 'Hebbal',     emoji: '📍', desc: 'Football + Cricket ground' },
];

export default function HomePage() {
  const router = useRouter();
  const [category, setCategory] = useState<BookingCategory | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [courtType, setCourtType] = useState<CourtType | null>(null);

  function handleCategorySelect(cat: BookingCategory) {
    setCategory(cat);
    setLocation(null);
    setCourtType(null);
    // Pickleball is always Hebbal
    if (cat === 'pickleball') setLocation('hebbal');
  }

  function handleContinue() {
    if (!category || !location || !courtType) return;
    router.push(`/book?category=${category}&location=${location}&court=${courtType}`);
  }

  const canContinue = !!category && !!location && !!courtType;

  return (
    <div className="space-y-6">
      {/* Step 1: Category */}
      <section className="space-y-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">What would you like to book?</h2>
          <p className="text-gray-500 text-sm mt-1">Matchbox Sports — Mysore</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Ground card */}
          <button
            onClick={() => handleCategorySelect('ground')}
            className={`rounded-2xl border-2 p-5 text-left transition-all shadow-sm hover:shadow-md cursor-pointer ${
              category === 'ground'
                ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
                : 'border-gray-200 bg-white hover:border-green-400'
            }`}
          >
            <div className="text-4xl mb-2">🏟️</div>
            <div className="font-bold text-gray-800 text-base">Ground</div>
            <div className="text-gray-500 text-xs mt-1">Football &amp; Cricket</div>
            <div className="text-gray-400 text-xs mt-1">Vijaynagar · Hebbal</div>
          </button>

          {/* Pickleball card */}
          <button
            onClick={() => handleCategorySelect('pickleball')}
            className={`rounded-2xl border-2 p-5 text-left transition-all shadow-sm hover:shadow-md cursor-pointer ${
              category === 'pickleball'
                ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
                : 'border-gray-200 bg-white hover:border-green-400'
            }`}
          >
            <div className="text-4xl mb-2">🏓</div>
            <div className="font-bold text-gray-800 text-base">Pickleball</div>
            <div className="text-gray-500 text-xs mt-1">4 dedicated courts</div>
            <div className="text-gray-400 text-xs mt-1">Hebbal only</div>
          </button>
        </div>
      </section>

      {/* Step 2: Location (Ground only — pickleball is always Hebbal) */}
      {category === 'ground' && (
        <section className="space-y-3">
          <h3 className="font-semibold text-gray-700">Choose Location</h3>
          <div className="grid grid-cols-2 gap-3">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => { setLocation(loc.id); setCourtType(null); }}
                className={`rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                  location === loc.id
                    ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
                    : 'border-gray-200 bg-white hover:border-green-400'
                }`}
              >
                <div className="text-2xl mb-1">{loc.emoji}</div>
                <div className="font-semibold text-gray-800">{loc.label}</div>
                <div className="text-gray-500 text-xs mt-0.5">{loc.desc}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Pickleball location badge */}
      {category === 'pickleball' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <span>📍</span>
          <span>All 4 pickleball courts are at <strong>Hebbal</strong></span>
        </div>
      )}

      {/* Step 3: Court selector */}
      {category === 'ground' && location && (
        <section className="space-y-3">
          <h3 className="font-semibold text-gray-700">Select Court — {location.charAt(0).toUpperCase() + location.slice(1)}</h3>
          <GroundPicker selected={courtType} onChange={setCourtType} />
        </section>
      )}

      {category === 'pickleball' && (
        <section className="space-y-3">
          <h3 className="font-semibold text-gray-700">Select a Court</h3>
          <PickleballCourtSelector selected={courtType} onChange={setCourtType} />
        </section>
      )}

      {/* Continue button */}
      {category && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`px-8 py-3 rounded-full font-semibold text-white text-sm transition-all shadow ${
              canContinue
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue — Pick Date &amp; Time &rarr;
          </button>
        </div>
      )}

      {/* How it works */}
      {!category && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-green-600 font-bold">1.</span> Pick Ground or Pickleball</li>
            <li className="flex gap-2"><span className="text-green-600 font-bold">2.</span> Select location &amp; court / half</li>
            <li className="flex gap-2"><span className="text-green-600 font-bold">3.</span> Choose date, time &amp; duration</li>
            <li className="flex gap-2"><span className="text-green-600 font-bold">4.</span> Submit — team gets WhatsApp instantly</li>
          </ol>
        </div>
      )}
    </div>
  );
}
