import { getStripe } from "@/stripe-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[PAYMENT-SHEET] POST body:", body);

    const raw = typeof body === "number" ? body : body?.amount ?? body?.value ?? null;
    const amountValue = Number(raw);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      console.error("[PAYMENT-SHEET] invalid amount:", raw);
      return new Response(JSON.stringify({ error: "invalid_amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const amountCents = Math.floor(amountValue * 100);
    console.log("[PAYMENT-SHEET] amount (reais):", amountValue, "cents:", amountCents);

    const stripe = await getStripe();

    const customer = await stripe.customers.create();
    console.log("[PAYMENT-SHEET] created customer id=", customer.id);

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2025-11-17.clover" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "brl",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });
    console.log("[PAYMENT-SHEET] created paymentIntent id=", paymentIntent.id);

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[PAYMENT-SHEET] error:", err?.message ?? err);
    return new Response(JSON.stringify({ error: err?.message ?? "internal_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}