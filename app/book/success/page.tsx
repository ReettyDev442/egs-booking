'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function SuccessContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('bookings').select('*, services(*)').eq('id', id).single()
      .then(({ data }) => setBooking(data));
  }, [id]);

  const payDeposit = async () => {
    if (!booking) return;
    setLoading(true);
    const res = await fetch('/api/paystack/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: booking.id }),
    });
    const data = await res.json();
    if (data.authorization_url) window.location.href = data.authorization_url;
    else { alert(data.error || 'Payment failed'); setLoading(false); }
  };

  const whatsapp = () => {
    const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const msg = encodeURIComponent(
      `Hello EGS, I just booked.\nName: ${booking?.full_name}\nService: ${booking?.services?.name}\nDate: ${booking?.preferred_date} ${booking?.preferred_time}`
    );
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  if (!booking) return <p className="p-8 text-center">Loading your booking details…</p>;

  return (
    <main className="p-8 max-w-xl mx-auto text-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-3xl font-bold mb-4">Booking received ✅</h1>
        <p className="mb-6 text-gray-600">We’ll confirm shortly. Pay the deposit to secure your slot.</p>

        <div className="bg-gray-100 p-4 rounded text-left mb-6 text-sm">
          <p className="mb-2"><strong>Service:</strong> {booking.services?.name}</p>
          <p className="mb-2"><strong>Date:</strong> {booking.preferred_date} {booking.preferred_time}</p>
          <p className="mb-2"><strong>Deposit:</strong> ₦{Number(booking.services?.deposit_amount).toLocaleString()}</p>
          <p><strong>Status:</strong> {booking.deposit_paid ? 'Paid ✅' : 'Pending'}</p>
        </div>

        {!booking.deposit_paid && (
          <button onClick={payDeposit} disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded w-full mb-3 font-medium">
            {loading ? 'Redirecting…' : 'Pay deposit now'}
          </button>
        )}

        <button onClick={whatsapp} className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded w-full font-medium">
          Chat on WhatsApp
        </button>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <SuccessContent />
    </Suspense>
  );
}