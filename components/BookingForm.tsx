'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (name: string, phone: string) => void;
  loading: boolean;
}

export default function BookingForm({ onSubmit, loading }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  function validate() {
    const e: { name?: string; phone?: string } = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(phone)) e.phone = 'Enter a valid 10-digit phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onSubmit(name.trim(), phone.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Kumar"
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 ${
            errors.name ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit mobile number"
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 ${
            errors.phone ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-full font-semibold text-white text-sm transition-all ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'
        }`}
      >
        {loading ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
