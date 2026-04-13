'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SportSelector from '@/components/SportSelector';
import { Sport } from '@/lib/types';

export default function HomePage() {
  const [sport, setSport] = useState<Sport | null>(null);
  const router = useRouter();

  function handleNext() {
    if (sport) router.push(`/book?sport=${sport}`);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Choose a Sport</h2>
        <p className="text-gray-500 mt-1">Pick what you want to play and book a slot instantly</p>
      </div>

      <SportSelector selected={sport} onChange={setSport} />

      <div className="flex justify-center">
        <button
          onClick={handleNext}
          disabled={!sport}
          className={`px-8 py-3 rounded-full font-semibold text-white text-sm transition-all shadow ${
            sport
              ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Continue to Book &rarr;
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">How it works</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span className="text-green-600 font-bold">1.</span> Pick sport &amp; date</li>
          <li className="flex gap-2"><span className="text-green-600 font-bold">2.</span> Choose start time &amp; duration</li>
          <li className="flex gap-2"><span className="text-green-600 font-bold">3.</span> Enter your name &amp; phone</li>
          <li className="flex gap-2"><span className="text-green-600 font-bold">4.</span> Submit — team is notified instantly on WhatsApp</li>
        </ol>
      </div>
    </div>
  );
}
