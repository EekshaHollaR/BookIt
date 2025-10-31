const BASE_URL = import.meta.env.SUPABASE_URL

export async function fetchExperiences() {
  const res = await fetch(`${BASE_URL}/experiences`)
  if (!res.ok) throw new Error("Failed to fetch experiences")
  return res.json()
}

export async function fetchExperienceById(id) {
  const res = await fetch(`${BASE_URL}/experiences?id=${id}`)
  if (!res.ok) throw new Error("Failed to fetch experience")
  return res.json()
}

export async function createBooking(booking) {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  })
  if (!res.ok) throw new Error("Booking failed")
  return res.json()
}


export async function validatePromo(promoCode) {
  const res = await fetch(`${BASE_URL}/promo-validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ promoCode }),
  })
  return res.json()
}
