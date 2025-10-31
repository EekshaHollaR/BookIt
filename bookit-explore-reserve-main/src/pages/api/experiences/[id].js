import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('experiences')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return res.status(400).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Experience not found' })

    // Optionally add slot info
    data.slots_available = data.available_slots > 0
    return res.status(200).json(data)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
