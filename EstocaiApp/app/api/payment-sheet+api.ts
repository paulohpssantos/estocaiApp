import { stripe } from '@/stripe-server';

export async function POST(req: Request) {
    const body = await req.json();
    console.log('[PAYMENT-SHEET] POST body:', body);

    // aceita tanto body = { amount: 1 } quanto body = 1
    const raw = typeof body === 'number' ? body : body?.amount ?? body?.value ?? null;
    const amountValue = Number(raw);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
        console.error('[PAYMENT-SHEET] invalid amount:', raw);
        return new Response(JSON.stringify({ error: 'invalid_amount' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const amountCents = Math.floor(amountValue * 100);
    console.log('[PAYMENT-SHEET] amount (reais):', amountValue, 'cents:', amountCents);

    const cunsumer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: cunsumer.id },
        { apiVersion: '2025-11-17.clover' }
    );

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'brl',
        customer: cunsumer.id,
        automatic_payment_methods: { enabled: true },
    });

    return Response.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: cunsumer.id,
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
}