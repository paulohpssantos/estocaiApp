import api from './api';

export interface PaymentSheetParams {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}

export async function fetchPaymentSheetParams(amount: number): Promise<PaymentSheetParams> {
  const { data } = await api.post('/api/payment-sheet', { amount });
  return data as PaymentSheetParams;
}