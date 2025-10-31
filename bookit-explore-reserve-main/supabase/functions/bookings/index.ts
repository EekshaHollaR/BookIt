// supabase/functions/bookings/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Only POST allowed", { status: 405 });
  }

  try {
    const { user_id, experience_id, slot_date, slot_time, persons } = await req.json();

    if (!user_id || !experience_id || !slot_date || !slot_time || !persons) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Check experience availability
    const { data: exp, error: expError } = await supabase
      .from("experiences")
      .select("available_slots, price")
      .eq("id", experience_id)
      .single();

    if (expError || !exp) {
      return new Response(JSON.stringify({ error: "Experience not found" }), { status: 404 });
    }

    if (exp.available_slots < persons) {
      return new Response(JSON.stringify({ error: "Not enough available slots" }), { status: 400 });
    }

    const total_price = exp.price * persons;

    // Insert booking
    const { data: booking, error: bookError } = await supabase
      .from("bookings")
      .insert([
        {
          user_id,
          experience_id,
          slot_date,
          slot_time,
          persons,
          total_price,
        },
      ])
      .select()
      .single();

    if (bookError) {
      return new Response(JSON.stringify({ error: bookError.message }), { status: 400 });
    }

    // Decrease available slots
    await supabase
      .from("experiences")
      .update({ available_slots: exp.available_slots - persons })
      .eq("id", experience_id);

    return new Response(JSON.stringify({ success: true, booking }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
