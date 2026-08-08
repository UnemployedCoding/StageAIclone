import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createCheckoutSession } from "@/lib/stripe";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { name, email, password, plan } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedPlan = (plan || "pro").toLowerCase();

    // 1. Create or get user using Supabase Admin (bypasses email rate limits)
    let userId: string;

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so rate limits are bypassed
      user_metadata: { full_name: name || "" },
    });

    if (createError) {
      // If user already exists, suggest signing in
      if (createError.message.toLowerCase().includes("already registered") || createError.message.toLowerCase().includes("already exists")) {
        return NextResponse.json({
          error: "An account with this email already exists. Please sign in instead.",
          code: "USER_EXISTS",
        }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    userId = createData.user.id;

    // Create user profile in profiles table if needed
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: name || "",
    });

    const origin =
      request.headers.get("origin") ||
      (request.headers.get("referer") ? new URL(request.headers.get("referer")!).origin : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // 2. Generate Stripe checkout session immediately
    const session = await createCheckoutSession({
      userId,
      userEmail: email,
      plan: normalizedPlan,
      origin,
      supabase: supabaseAdmin,
    });

    return NextResponse.json({ url: session.url, userId });
  } catch (err: any) {
    console.error("Signup-checkout route error:", err);
    return NextResponse.json({ error: err.message || "Failed to create account and checkout session" }, { status: 500 });
  }
}
