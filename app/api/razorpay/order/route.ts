import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid transaction amount in INR is required' },
        { status: 400 }
      );
    }

    // Amount in subunits (paise for INR)
    const amountInPaise = Math.round(Number(amount) * 100);
    const mockRazorpayOrderId = `order_kvp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      id: mockRazorpayOrderId,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: notes || {},
      created_at: Math.floor(Date.now() / 1000),
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_kisan_vyapar_demo'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error while initiating payment' },
      { status: 500 }
    );
  }
}
