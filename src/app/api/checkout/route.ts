import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createCheckoutSession } from "@/lib/stripe";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json().catch(() => ({}));
  const { plan, userId: requestedUserId, email: requestedEmail } = body;

  if (!plan) {
    return NextResponse.json({ error: "Missing plan parameter" }, { status: 400 });
  }

  let targetUserId = user?.id;
  let targetEmail = user?.email;

  // If no cookie session exists yet (e.g. freshly created account before email confirmation)
  if (!targetUserId && requestedUserId) {
    const { data: adminUserData, error: adminUserErr } = await supabaseAdmin.auth.admin.getUserById(requestedUserId);
    if (!adminUserErr && adminUserData?.user) {
      targetUserId = adminUserData.user.id;
      targetEmail = adminUserData.user.email || requestedEmail;
    }
  }

  if (!targetUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    request.headers.get("origin") ||
    (request.headers.get("referer") ? new URL(request.headers.get("referer")!).origin : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  try {
    const session = await createCheckoutSession({
      userId: targetUserId,
      userEmail: targetEmail,
      plan,
      origin,
      supabase: supabaseAdmin,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Failed to create Stripe checkout session:", err);
    return NextResponse.json({ error: err.message || "Checkout session creation failed" }, { status: 400 });
  }
}
