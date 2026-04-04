import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      // Return a no-op client for build time — won't be called during runtime
      // without a real key
      _stripe = new Stripe("sk_test_placeholder_build_only", {
        apiVersion: "2026-02-25.clover",
      });
    } else {
      _stripe = new Stripe(key, {
        apiVersion: "2026-02-25.clover",
      });
    }
  }
  return _stripe;
}

// Named export for convenience
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get subscriptions() { return getStripe().subscriptions; },
  get customers() { return getStripe().customers; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
  get prices() { return getStripe().prices; },
} satisfies Partial<Stripe>;

export const STRIPE_PRICE_MONTHLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? "price_monthly";
export const STRIPE_PRICE_YEARLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? "price_yearly";
