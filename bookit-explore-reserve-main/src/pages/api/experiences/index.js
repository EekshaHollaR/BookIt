import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('experiences')
      .select('*')
      .order('id')

    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json(data)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
