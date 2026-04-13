'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BookingCard from '@/components/BookingCard';
import AvailabilityTimeline from '@/components/AvailabilityTimeline';
import { Booking, BlockedSlot, BookingCategory, Location, CourtType } from '@/lib/types';
import { getNext14Days, formatDayLabel, generateTimeSlots } from '@/lib/utils';

const CATEGORIES: { id: BookingCategory; label: string }[] = [
  { id: 'ground', label: 'Ground' },
  { id: 'pickleball', label: 'Pickleball' },
];

const LOCATIONS: { id: Location; label: string }[] = [
  { id: 'vijaynagar', label: 'Vijaynagar' },
  { id: 'hebbal', label: 'Hebbal' },
];

const GROUND_COURTS: { id: CourtType; label: string }[] = [
  { id: 'full', label: 'Full Court' },
  { id: 'left_half', label: 'Left Half' },
  { id: 'right_half', label: 'Right Half' },
];

const PICKLEBALL_COURTS: { id: CourtType; label: string }[] = [
  { id: 'court_1', label: 'Court 1' },
  { id: 'court_2', label: 'Court 2' },
  { id: 'court_3', label: 'Court 3' },
  { id: 'court_4', label: 'Court 4' },
];

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [filterCategory, setFilterCategory] = useState<BookingCategory | 'all'>('all');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Block period form state
  const [blockCategory, setBlockCategory] = useState<BookingCategory>('ground');
  const [blockLocation, setBlockLocation] = useState<Location>('vijaynagar');
  const [blockCourt, setBlockCourt] = useState<CourtType>('full');
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockStart, setBlockStart] = useState('06:00');
  const [blockEnd, setBlockEnd] = useState('07:00');
  const [blockReason, setBlockReason] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockMsg, setBlockMsg] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { setAuthed(true); }
      else { router.replace('/admin/login'); }
      setAuthChecked(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authed) return;
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, filterDate, filterCategory]);

  async function fetchData() {
    const params = new URLSearchParams({ date: filterDate });
    if (filterCategory !== 'all') params.set('category', filterCategory);

    const [bRes, blRes] = await Promise.all([
      fetch(`/api/admin/bookings?${params}`),
      fetch(`/api/admin/block?${params}`),
    ]);
    const bData = await bRes.json();
    const blData = await blRes.json();
    setBookings(bData.bookings ?? []);
    setBlockedSlots(blData.blockedSlots ?? []);
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return;
    await fetch('/api/admin/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  async function handleBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!blockReason.trim()) { setBlockMsg('Please enter a reason'); return; }
    setBlockLoading(true);
    setBlockMsg('');
    const res = await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: blockCategory, location: blockLocation, court_type: blockCourt, date: blockDate, start_time: blockStart, end_time: blockEnd, reason: blockReason }),
    });
    if (res.ok) {
      setBlockMsg('Period blocked successfully');
      setBlockReason('');
      fetchData();
    } else {
      const d = await res.json();
      setBlockMsg(d.error ?? 'Failed to block');
    }
    setBlockLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  if (!authChecked) return <p className="text-center text-gray-400 py-16">Loading...</p>;
  if (!authed) return null;

  const days = getNext14Days();
  const slots = generateTimeSlots();
  const filteredBookings = bookings.filter((b) => b.date === filterDate);
  const blockCourtOptions = blockCategory === 'pickleball' ? PICKLEBALL_COURTS : GROUND_COURTS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <button onClick={handleSignOut} className="text-sm text-red-500 hover:text-red-700 underline cursor-pointer">Sign out</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
            >
              {days.map((d) => (
                <option key={d} value={d}>{formatDayLabel(d)}{d === days[0] ? ' (Today)' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as BookingCategory | 'all')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
            >
              <option value="all">All</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline grouped by category + location */}
      {(['ground', 'pickleball'] as BookingCategory[])
        .filter((cat) => filterCategory === 'all' || filterCategory === cat)
        .map((cat) => (
          <div key={cat} className="space-y-2">
            <p className="text-sm font-bold text-gray-700 capitalize">{cat === 'pickleball' ? '🏓 Pickleball — Hebbal' : '🏟️ Ground'}</p>
            <AvailabilityTimeline
              bookings={bookings.filter((b) => b.category === cat)}
              blockedSlots={blockedSlots.filter((bl) => bl.category === cat)}
            />
          </div>
        ))}

      {/* Bookings list */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Bookings ({filteredBookings.length})</h3>
        {filteredBookings.length === 0 ? (
          <p className="text-gray-400 text-sm">No bookings for this date.</p>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} showCancel />
            ))}
          </div>
        )}
      </div>

      {/* Block Period Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Block a Period</h3>
        <form onSubmit={handleBlock} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={blockCategory}
                onChange={(e) => { setBlockCategory(e.target.value as BookingCategory); setBlockCourt('full'); }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Location</label>
              <select
                value={blockLocation}
                onChange={(e) => setBlockLocation(e.target.value as Location)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Court</label>
              <select
                value={blockCourt}
                onChange={(e) => setBlockCourt(e.target.value as CourtType)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                {blockCourtOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <select
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                {days.map((d) => <option key={d} value={d}>{formatDayLabel(d)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <select
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                {slots.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Time</label>
              <select
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                {slots.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Reason</label>
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Maintenance, Tournament"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
            />
          </div>
          {blockMsg && <p className={`text-sm ${blockMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{blockMsg}</p>}
          <button
            type="submit"
            disabled={blockLoading}
            className={`px-6 py-2 rounded-full text-sm font-medium text-white transition-all ${
              blockLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 cursor-pointer'
            }`}
          >
            {blockLoading ? 'Blocking...' : 'Block Period'}
          </button>
        </form>
      </div>
    </div>
  );
}
