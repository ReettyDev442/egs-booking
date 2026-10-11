import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initializePaystack } from '@/lib/paystack';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { booking_id } = await req.json();
  if (!booking_id) return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });

  const { data: booking, error } = await admin
    .from('bookings')
    .select('*, services(*)')
    .eq('id', booking_id)
    .single();

  if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.deposit_paid) return NextResponse.json({ error: 'Already paid' }, { status: 400 });

  const email = booking.email || `booking-${booking.id}@egs.local`;
  const reference = `EGS-${booking.id.slice(0, 8)}-${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const pay = await initializePaystack({
      email,
      amount: Number(booking.services.deposit_amount),
      reference,
      callback_url: `${siteUrl}/book/success?id=${booking.id}`,
    });

    await admin.from('bookings')
      .update({ deposit_reference: reference })
      .eq('id', booking.id);

    return NextResponse.json({ authorization_url: pay.authorization_url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}