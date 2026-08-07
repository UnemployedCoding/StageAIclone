import { stripe } from "./src/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const userId = "8a61779c-edb8-405e-bea7-22cd6bd31882"; // from the event
  const subId = "sub_1TnZkyIeq52i3OHhdN6vdGnG";
  const plan = "pro";
  const customer = "cus_UnA4ysR32jB92s";

  try {
    const sub = await stripe.subscriptions.retrieve(subId);
    console.log("Sub retrieved:", sub.id);
    
    const { error: subErr } = await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      plan,
      billing: "monthly",
      status: "active",
      stripe_subscription_id: sub.id,
      stripe_customer_id: customer,
      current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
    });
    console.log("Upsert error:", subErr);

    const { error: profErr } = await supabaseAdmin.from("profiles").update({
      credits_remaining: 45,
    }).eq("id", userId);
    console.log("Profile update error:", profErr);

  } catch (err) {
    console.error("Caught error:", err);
  }
}
run();
