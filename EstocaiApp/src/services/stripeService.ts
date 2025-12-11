import api from './api';

export type CreateCheckoutSessionRequest = {
  amount: number; // em cents, ex: 1500
  currency?: string;
  name?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type CreateCheckoutSessionResponse = {
  checkoutUrl?: string; // session.url (Stripe Checkout)
  sessionId?: string;
  resposta?:string;
  [key: string]: any;
};

export async function createCheckoutSession(body: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
  const resp = await api.post('/stripe/create-checkout-session', body);
  return resp.data as CreateCheckoutSessionResponse;
}