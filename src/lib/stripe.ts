import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const getAdminClient = () => {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return null;
};

// Live Price IDs for StageLumen (AUD)
const LIVE_PRICES: Record<string, string> = {
  base: "price_1U2DMCIeq52i3OHhzYDrLff5",
  pro: "price_1TnYEIIeq52i3OHhoOf0SLki",
  business: "price_1TnYFBIeq52i3OHhzYbbFKAi",
};

// Test Price IDs for Local Testing
const TEST_PRICES: Record<string, string> = {
  base: "price_1TnZXKIeq52i3OHhIoieAhQI",
  pro: "price_1TnZXfIeq52i3OHhuudeBMXq",
  business: "price_1TnZXsIeq52i3OHhS9VIZRKT",
};

export const getStripePriceId = (plan: string): string => {
  const normalized = plan.toLowerCase();
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const isLive = secretKey.startsWith("sk_live_");

  if (isLive) {
    return (
      LIVE_PRICES[normalized] ||
      process.env[`STRIPE_PRICE_${normalized.toUpperCase()}_MONTHLY`] ||
      LIVE_PRICES.pro
    );
  }

  return (
    process.env[`STRIPE_PRICE_${normalized.toUpperCase()}_MONTHLY`] ||
    TEST_PRICES[normalized] ||
    TEST_PRICES.pro
  );
};

export async function createCheckoutSession({
  userId,
  userEmail,
  plan,
  origin,
  supabase,
}: {
  userId: string;
  userEmail?: string;
  plan: string;
  origin: string;
  supabase?: any;
}) {
  const normalizedPlan = plan.toLowerCase();
  const priceId = getStripePriceId(normalizedPlan);

  if (!priceId) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const dbClient = getAdminClient() || supabase;

  // Look up or create Stripe customer
  let customerId: string | undefined;

  if (dbClient) {
    const { data: profile } = await dbClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    customerId = profile?.stripe_customer_id;
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;

    if (dbClient) {
      await dbClient.from("profiles").upsert({
        id: userId,
        stripe_customer_id: customerId,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout_success=true`,
    cancel_url: `${origin}/prices?canceled=true`,
    metadata: { supabase_user_id: userId, plan: normalizedPlan, billing: "monthly" },
  });

  return session;
}
