// supabase/functions/experiences/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (req.method === "GET") {
    if (id) {
      // Single experience details
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
      return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    } else {
      // All experiences
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
      return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
