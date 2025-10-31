import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, experienceId, slotDate, persons } = req.body

    // Get price
    const { data: exp } = await supabaseAdmin
      .from('experiences')
      .select('price, available_slots')
      .eq('id', experienceId)
      .maybeSingle()

    if (!exp) return res.status(404).json({ error: 'Experience not found' })
    if (exp.available_slots < persons)
      return res.status(400).json({ error: 'Not enough slots available' })

    const total = exp.price * persons

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{ user_id: userId, experience_id: experienceId, slot_date: slotDate, persons, total_price: total }])
      .select()

    if (error) return res.status(400).json({ error: error.message })

    // Update available slots
    await supabaseAdmin
      .from('experiences')
      .update({ available_slots: exp.available_slots - persons })
      .eq('id', experienceId)

    return res.status(200).json({ message: 'Booking confirmed', data })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
