import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role key for webhook — bypasses Row Level Security
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Credits granted per plan (1 credit = 1 MNMLAI generation)
const PLAN_CREDITS: Record<string, number> = {
  base: 25,
  pro: 75,
  business: 200,
};

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {

    // ── New subscription: save to DB and grant credits ──────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;

      try {
        if (userId && session.subscription && plan) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const credits = PLAN_CREDITS[plan] ?? 0;

          // Save subscription record
          const { error: subErr } = await supabaseAdmin.from("subscriptions").upsert({
            user_id: userId,
            plan,
            billing: "monthly",
            status: "active",
            stripe_subscription_id: sub.id,
            stripe_customer_id: session.customer as string,
            current_period_end: new Date(((sub as any).current_period_end || sub.items?.data[0]?.current_period_end || Date.now() / 1000) * 1000).toISOString(),
          }, { onConflict: "stripe_subscription_id" });
          
          if (subErr) console.error("Supabase upsert error:", subErr);

          // Grant credits to the user's profile and save customer ID
          const { error: profErr } = await supabaseAdmin.from("profiles").update({
            credits_remaining: credits,
            stripe_customer_id: session.customer as string,
          }).eq("id", userId);
          
          if (profErr) console.error("Supabase profile update error:", profErr);

          // Auto-confirm user email in Supabase since payment succeeded
          try {
            await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
          } catch (confirmErr) {
            console.error("Failed to auto-confirm user in Supabase:", confirmErr);
          }

          console.log(`✅ Granted ${credits} credits to user ${userId} on plan ${plan}`);
        }
      } catch (err: any) {
        console.error("Webhook processing error:", err);
        return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
      }
      break;
    }

    // ── Monthly renewal: reset credits for the new billing period ───────────
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubId = (invoice as unknown as { subscription: string }).subscription;
      if (!stripeSubId) break;

      // Get the subscription record to find user and plan
      const { data: subRecord } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id, plan")
        .eq("stripe_subscription_id", stripeSubId)
        .eq("status", "active")
        .single();

      if (subRecord) {
        const credits = PLAN_CREDITS[subRecord.plan] ?? 0;
        await supabaseAdmin.from("profiles").update({
          credits_remaining: credits,
        }).eq("id", subRecord.user_id);

        console.log(`🔄 Reset ${credits} credits for user ${subRecord.user_id} on renewal`);
      }
      break;
    }

    // ── Subscription updated (e.g. plan change) ─────────────────────────────
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status === "active" ? "active" : "inactive";
      await supabaseAdmin.from("subscriptions").update({
        status,
        current_period_end: new Date((((sub as any).current_period_end || sub.items?.data[0]?.current_period_end) as number) * 1000).toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      break;
    }

    // ── Subscription cancelled: set status and zero out credits ─────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      const { data: subRecord } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", sub.id)
        .single();

      await supabaseAdmin.from("subscriptions").update({
        status: "canceled",
      }).eq("stripe_subscription_id", sub.id);

      // Zero out credits on cancellation
      if (subRecord) {
        await supabaseAdmin.from("profiles").update({
          credits_remaining: 0,
        }).eq("id", subRecord.user_id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
