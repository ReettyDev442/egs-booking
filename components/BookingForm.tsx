'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  service_id: z.string().min(1, 'Pick a service'),
  full_name: z.string().min(2, 'Enter full name'),
  phone: z.string().min(10, 'Enter phone number'),
  email: z.string().email().optional().or(z.literal('')),
  preferred_date: z.string().min(1, 'Pick a date'),
  preferred_time: z.string().min(1, 'Pick a time'),
  bust: z.string().optional(),
  waist: z.string().optional(),
  hips: z.string().optional(),
  length: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function BookingForm() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const selectedServiceId = watch('service_id');
  const selectedService = services.find(s => s.id === selectedServiceId);

  useEffect(() => {
    supabase.from('services').select('*').eq('active', true)
      .then(({ data }) => setServices(data || []));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const { bust, waist, hips, length, ...rest } = values;
    const measurements = { bust, waist, hips, length };

    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...rest, measurements, status: 'pending' })
      .select()
      .single();

    setSubmitting(false);
    if (error) return alert(error.message);
    router.push(`/book/success?id=${data.id}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl mx-auto bg-white p-6 rounded shadow-md">
      <div>
        <label className="block font-medium mb-1">Service</label>
        <select {...register('service_id')} className="w-full border p-2 rounded">
          <option value="">Select a service</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} — from ₦{Number(s.price_from).toLocaleString()}
            </option>
          ))}
        </select>
        {errors.service_id && <p className="text-red-500 text-sm mt-1">{errors.service_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Full name</label>
          <input {...register('full_name')} className="w-full border p-2 rounded" />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input {...register('phone')} className="w-full border p-2 rounded" />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Email (optional)</label>
        <input type="email" {...register('email')} className="w-full border p-2 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Date</label>
          <input type="date" min={today} {...register('preferred_date')} className="w-full border p-2 rounded" />
          {errors.preferred_date && <p className="text-red-500 text-sm mt-1">{errors.preferred_date.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Time</label>
          <input type="time" {...register('preferred_time')} className="w-full border p-2 rounded" />
          {errors.preferred_time && <p className="text-red-500 text-sm mt-1">{errors.preferred_time.message}</p>}
        </div>
      </div>

      <fieldset className="border p-4 rounded">
        <legend className="px-2 font-medium text-sm text-gray-600">Measurements (inches, optional)</legend>
        <div className="grid grid-cols-4 gap-3">
          <input {...register('bust')}   placeholder="Bust"   className="border p-2 rounded" />
          <input {...register('waist')}  placeholder="Waist"  className="border p-2 rounded" />
          <input {...register('hips')}   placeholder="Hips"   className="border p-2 rounded" />
          <input {...register('length')} placeholder="Length" className="border p-2 rounded" />
        </div>
      </fieldset>

      <div>
        <label className="block font-medium mb-1">Notes</label>
        <textarea {...register('notes')} rows={3} className="w-full border p-2 rounded" placeholder="Any extra details..."></textarea>
      </div>

      {selectedService && (
        <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
          Deposit required: <strong>₦{Number(selectedService.deposit_amount).toLocaleString()}</strong>
        </div>
      )}

      <button
        disabled={submitting}
        className="bg-black text-white px-6 py-3 rounded w-full disabled:opacity-50 font-medium hover:bg-gray-800"
      >
        {submitting ? 'Booking…' : 'Book now'}
      </button>
    </form>
  );
}