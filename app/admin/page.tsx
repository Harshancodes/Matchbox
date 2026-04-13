'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BookingCard from '@/components/BookingCard';
import AvailabilityTimeline from '@/components/AvailabilityTimeline';
import { Booking, BlockedSlot, Sport } from '@/lib/types';
import { getNext14Days, formatDayLabel, generateTimeSlots, addHours } from '@/lib/utils';

const SPORTS: Sport[] = ['cricket', 'football', 'badminton'];

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [filterSport, setFilterSport] = useState<Sport | 'all'>('all');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Block period form state
  const [blockSport, setBlockSport] = useState<Sport>('cricket');
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
  }, [authed, filterDate, filterSport]);

  async function fetchData() {
    const params = new URLSearchParams({ date: filterDate });
    if (filterSport !== 'all') params.set('sport', filterSport);

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
    await fetch(`/api/admin/cancel`, {
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
      body: JSON.stringify({ sport: blockSport, date: blockDate, start_time: blockStart, end_time: blockEnd, reason: blockReason }),
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
  const todayBookings = bookings.filter((b) => b.date === filterDate);

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
            <label className="block text-xs text-gray-500 mb-1">Sport</label>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value as Sport | 'all')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
            >
              <option value="all">All Sports</option>
              {SPORTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline per sport for selected date */}
      {SPORTS.filter((s) => filterSport === 'all' || filterSport === s).map((sport) => (
        <div key={sport} className="space-y-1">
          <p className="text-sm font-medium text-gray-600 capitalize">{sport}</p>
          <AvailabilityTimeline
            bookings={bookings.filter((b) => b.sport === sport)}
            blockedSlots={blockedSlots.filter((bl) => bl.sport === sport)}
          />
        </div>
      ))}

      {/* Bookings list */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Bookings ({todayBookings.length})</h3>
        {todayBookings.length === 0 ? (
          <p className="text-gray-400 text-sm">No bookings for this date.</p>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((b) => (
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
              <label className="block text-xs text-gray-500 mb-1">Sport</label>
              <select
                value={blockSport}
                onChange={(e) => setBlockSport(e.target.value as Sport)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none"
              >
                {SPORTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
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
