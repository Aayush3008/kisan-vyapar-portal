import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const isAuthentic = signature === expectedSignature || process.env.NODE_ENV === 'development';

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid Razorpay webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Process event types: payment.captured, order.paid, payment.failed
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity;
      return NextResponse.json({
        received: true,
        event,
        order_id: paymentEntity.order_id,
        payment_id: paymentEntity.id,
        status: 'escrow_credited'
      });
    }

    return NextResponse.json({ received: true, event });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error processing webhook' },
      { status: 500 }
    );
  }
}
