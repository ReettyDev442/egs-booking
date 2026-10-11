export async function initializePaystack(params: {
  email: string;
  amount: number;
  reference: string;
  callback_url: string;
}) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100),
      reference: params.reference,
      callback_url: params.callback_url,
    }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || 'Paystack init failed');
  return data.data as { authorization_url: string; access_code: string; reference: string };
}