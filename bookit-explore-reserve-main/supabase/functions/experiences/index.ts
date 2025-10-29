import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const experienceId = pathParts[pathParts.length - 1];

    // GET /experiences/:id - Return details and slot availability
    if (req.method === 'GET' && experienceId && experienceId !== 'experiences') {
      console.log('Fetching experience details for ID:', experienceId);
      
      const { data: experience, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', experienceId)
        .single();

      if (expError) {
        console.error('Error fetching experience:', expError);
        return new Response(
          JSON.stringify({ error: 'Experience not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: timeSlots, error: slotsError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('experience_id', experienceId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (slotsError) {
        console.error('Error fetching time slots:', slotsError);
      }

      // Group time slots by date
      const dateMap: Record<string, any[]> = {};
      const timeMap: Record<string, any[]> = {};

      (timeSlots || []).forEach((slot) => {
        if (!dateMap[slot.date]) {
          dateMap[slot.date] = [];
        }
        const timeKey = `${slot.date}-${slot.time}`;
        if (!timeMap[timeKey]) {
          timeMap[timeKey] = slot;
        }
      });

      const availableDates = Object.keys(dateMap);
      const availableTimes = Object.values(timeMap);

      const result = {
        ...experience,
        availableDates,
        availableTimes: availableTimes.map((slot: any) => ({
          time: slot.time,
          available: slot.available,
          soldOut: slot.sold_out
        }))
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /experiences - Return list of experiences
    if (req.method === 'GET') {
      console.log('Fetching all experiences');
      
      const { data: experiences, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching experiences:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Transform database format to frontend format
      const transformed = experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        location: exp.location,
        description: exp.description,
        longDescription: exp.long_description,
        price: exp.price,
        image: exp.image,
        category: exp.category,
        borderColor: exp.border_color,
        badge: exp.badge_text ? {
          text: exp.badge_text,
          color: exp.badge_color
        } : undefined
      }));

      return new Response(JSON.stringify(transformed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in experiences function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
