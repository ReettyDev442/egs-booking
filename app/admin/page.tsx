'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('bookings')
      .select('*, services(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setBookings(data || []));
  }, [user]);

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const logout = () => supabase.auth.signOut();

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    setBookings(b => b.map(x => x.id === id ? { ...x, status } : x));
  };

  if (!user) {
    return (
      <main className="p-8 max-w-sm mx-auto space-y-3 min-h-screen flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-center mb-4">EGS Admin Login</h1>
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" className="border p-2 w-full rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)}
          type="password" placeholder="Password" className="border p-2 w-full rounded" />
        <button onClick={login} className="bg-black text-white p-2 rounded w-full font-medium">Login</button>
      </main>
    );
  }

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EGS Bookings Dashboard</h1>
        <button onClick={logout} className="text-sm underline text-gray-600">Logout</button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Service</th>
              <th className="p-3">Date</th>
              <th className="p-3">Deposit</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{b.full_name}</div>
                  <div className="text-xs text-gray-500">{b.phone}</div>
                </td>
                <td className="p-3">{b.services?.name}</td>
                <td className="p-3">{b.preferred_date} <br/> {b.preferred_time}</td>
                <td className="p-3">{b.deposit_paid ? '✅' : '—'}</td>
                <td className="p-3 capitalize">{b.status}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => updateStatus(b.id, 'confirmed')} className="text-green-600 hover:underline">Confirm</button>
                  <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-red-600 hover:underline">Cancel</button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}