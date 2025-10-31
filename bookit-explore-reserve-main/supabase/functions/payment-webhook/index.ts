import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === "GET" && path === "/experiences") {
    const { data, error } = await supabase.from("experiences").select("*");
    if (error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET" && path.startsWith("/experiences/")) {
    const id = path.split("/")[2];
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("id", id)
      .single();
    if (error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
});
