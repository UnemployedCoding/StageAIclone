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

// Map plan names to Stripe Price IDs (monthly only)
export const STRIPE_PRICES: Record<string, { monthly: string }> = {
  base: {
    monthly: process.env.STRIPE_PRICE_BASE_MONTHLY!,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
  },
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
  const priceId = STRIPE_PRICES[normalizedPlan]?.monthly;

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
