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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const bookingData = await req.json();
    console.log('Creating booking:', bookingData);

    // Validate required fields
    if (!bookingData.experienceId || !bookingData.date || !bookingData.time || 
        !bookingData.quantity || !bookingData.fullName || !bookingData.email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check slot availability and prevent double-booking
    const { data: slot, error: slotError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('experience_id', bookingData.experienceId)
      .eq('date', bookingData.date)
      .eq('time', bookingData.time)
      .single();

    if (slotError || !slot) {
      console.error('Error fetching slot:', slotError);
      return new Response(
        JSON.stringify({ error: 'Time slot not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (slot.sold_out || slot.available < bookingData.quantity) {
      return new Response(
        JSON.stringify({ error: 'Not enough slots available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate booking reference
    const bookingRef = `HUF${Math.random().toString(36).substr(2, 4).toUpperCase()}SO`;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_ref: bookingRef,
        experience_id: bookingData.experienceId,
        experience_name: bookingData.experienceName,
        date: bookingData.date,
        time: bookingData.time,
        quantity: bookingData.quantity,
        full_name: bookingData.fullName,
        email: bookingData.email,
        price: bookingData.price,
        taxes: bookingData.taxes,
        discount: bookingData.discount || 0,
        total: bookingData.total,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update slot availability
    const newAvailable = slot.available - bookingData.quantity;
    const { error: updateError } = await supabase
      .from('time_slots')
      .update({ 
        available: newAvailable,
        sold_out: newAvailable === 0
      })
      .eq('id', slot.id);

    if (updateError) {
      console.error('Error updating slot:', updateError);
      // Note: Booking was created but slot not updated - might need rollback logic
    }

    console.log('Booking created successfully:', bookingRef);
    return new Response(
      JSON.stringify({ bookingRef, booking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in bookings function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
