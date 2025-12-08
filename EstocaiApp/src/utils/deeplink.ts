export function buildPaypalCallbackUrls(scheme = "estocai") {
  const returnUrl = `${scheme}://paypal-return`; // PayPal irá acrescentar ?token=...
  const cancelUrl = `${scheme}://paypal-cancel`;
  return { returnUrl, cancelUrl };
}