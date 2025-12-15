let _stripe: any | null = null;

export async function getStripe() {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set in environment");

  // import dinâmico para evitar bundling em ambiente cliente/web
  const mod = await import("stripe");
  const StripeCtor = (mod && (mod as any).default) ? (mod as any).default : mod;

  _stripe = new StripeCtor(key, {
    apiVersion: "2025-11-17.clover",
    appInfo: { name: "EstocaiApp" },
  });

  return _stripe;
}