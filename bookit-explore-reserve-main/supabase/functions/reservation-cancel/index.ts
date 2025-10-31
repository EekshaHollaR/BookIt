// supabase/functions/reservation-cancel/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.split(" ")[1];
    const user = await supabase.auth.getUser(token);

    if (!user?.data?.user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "Missing bookingId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Step 1: Check booking ownership and status
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (booking.user_id !== user.data.user.id) {
      return new Response(JSON.stringify({ error: "Not authorized to cancel this booking" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (booking.status === "cancelled") {
      return new Response(JSON.stringify({ message: "Already cancelled" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Step 2: Update booking status
    const { error: cancelError } = await supabase
      .from("bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (cancelError) throw cancelError;

    // ✅ Step 3: Process refund (if payment exists)
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    if (payment && payment.status === "success") {
      await supabase
        .from("payments")
        .update({ status: "refund_initiated" })
        .eq("id", payment.id);

      // (Optional) Trigger Razorpay/Stripe refund via webhook or external call
    }

    return new Response(JSON.stringify({ success: true, message: "Booking cancelled successfully" }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
});
