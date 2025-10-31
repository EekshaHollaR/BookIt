// supabase/functions/promo-validate/index.ts
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

  const { promoCode } = await req.json();
  if (!promoCode) {
    return new Response(JSON.stringify({ error: "promoCode required" }), { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("promo_code", promoCode)
    .lte("valid_from", today)
    .gte("valid_to", today)
    .maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify({ valid: false, error: "Invalid or expired promo code" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }

  return new Response(JSON.stringify({ valid: true, discount: data.discount_percent }), {
    headers: { "Content-Type": "application/json" },
  });
});
