import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, billing = "monthly" } = await request.json();
  const priceId = STRIPE_PRICES[plan]?.monthly;

  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan or billing cycle" }, { status: 400 });
  }

  // Look up or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").upsert({
      id: user.id,
      stripe_customer_id: customerId,
    });
  }

  const origin =
    request.headers.get("origin") ||
    (request.headers.get("referer") ? new URL(request.headers.get("referer")!).origin : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?success=true`,
    cancel_url: `${origin}/prices?canceled=true`,
    metadata: { supabase_user_id: user.id, plan, billing },
  });

  return NextResponse.json({ url: session.url });
}
