import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { promoCode } = req.body

  const { data, error } = await supabaseAdmin
    .from('promotions')
    .select('*')
    .eq('promo_code', promoCode)
    .maybeSingle()

  if (error) return res.status(400).json({ error: error.message })
  if (!data) return res.status(404).json({ valid: false, message: 'Invalid promo code' })

  const now = new Date()
  if (now < new Date(data.valid_from) || now > new Date(data.valid_to)) {
    return res.status(400).json({ valid: false, message: 'Promo code expired' })
  }

  return res.status(200).json({ valid: true, discount: data.discount_percent })
}
