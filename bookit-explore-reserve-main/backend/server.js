require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const PORT = process.env.PORT || 8081;
const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: true, // set explicit origin in production, e.g. https://your-frontend.com
  credentials: true
}));
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    // keep raw body for webhook signature verification
    req.rawBody = buf.toString();
  }
}));

// Supabase admin client (service_role)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper: verify Supabase JWT (user token) and return user object
async function verifyUserToken(bearerToken) {
  if (!bearerToken) return null;
  const token = bearerToken.split(' ')[1] || bearerToken;
  try {
    const resp = await supabaseAdmin.auth.getUser(token);
    return resp?.data?.user || null;
  } catch (err) {
    console.error("JWT verify error", err);
    return null;
  }
}

// Middleware to require auth
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
  const user = await verifyUserToken(authHeader);
  if (!user) return res.status(401).json({ error: "Invalid or expired token" });
  req.user = user;
  next();
}

/**
 * POST /api/promo/validate
 * Request: { promoCode: string }
 * Returns: { valid: boolean, discount?: number, message?: string }
 */
app.post('/api/promo/validate', async (req, res) => {
  const { promoCode } = req.body || {};
  if (!promoCode) return res.status(400).json({ error: "promoCode is required" });

  try {
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .select('*')
      .eq('code', promoCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.json({ valid: false, message: "Invalid code" });

    // Optional: check expiry/usage
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.json({ valid: false, message: "Code expired" });
    }

    res.json({ valid: true, discount: data.discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/bookings
 * Protected: requires user token (frontend should pass user's access token)
 * Body: { space_id, start_ts, end_ts }
 */
app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const { space_id, start_ts, end_ts } = req.body;
    if (!space_id || !start_ts || !end_ts) return res.status(400).json({ error: "Missing required fields" });

    // Check availability: any bookings overlapping?
    const { data: overlapping, error: checkErr } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('space_id', space_id)
      .or(
        `and(start_ts.gte.${start_ts},start_ts.lt.${end_ts}),and(end_ts.gt.${start_ts},end_ts.lte.${end_ts}),and(start_ts.lt.${start_ts},end_ts.gt.${end_ts})`
      );

    if (checkErr) throw checkErr;
    if (overlapping?.length > 0) {
      return res.status(409).json({ error: "Space not available for selected time range" });
    }

    // Insert reservation (user id = req.user.id)
    const insertPayload = {
      user_id: req.user.id,
      space_id,
      start_ts,
      end_ts,
      status: 'confirmed'
    };

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert([insertPayload])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, reservation: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/reservations/cancel
 * Protected: requires user token
 * Body: { reservation_id }
 */
app.post('/api/reservations/cancel', requireAuth, async (req, res) => {
  try {
    const { reservation_id } = req.body;
    if (!reservation_id) return res.status(400).json({ error: "reservation_id required" });

    // Retrieve reservation
    const { data: reservation, error: fetchErr } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('id', reservation_id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!reservation) return res.status(404).json({ error: "Reservation not found" });
    if (reservation.user_id !== req.user.id) return res.status(403).json({ error: "Not authorized to cancel" });

    if (reservation.status === 'cancelled') {
      return res.json({ message: "Already cancelled" });
    }

    // Update booking status
    const { error: cancelErr } = await supabaseAdmin
      .from('reservations')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', reservation_id);

    if (cancelErr) throw cancelErr;

    // Optional: mark payment as refund_initiated
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('reservation_id', reservation_id)
      .maybeSingle();

    if (payErr) throw payErr;
    if (payment && payment.status === 'success') {
      const { error: up } = await supabaseAdmin
        .from('payments')
        .update({ status: 'refund_initiated' })
        .eq('id', payment.id);
      if (up) console.error("Failed to mark refund:", up);
    }

    res.json({ success: true, message: "Reservation cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/payment/webhook
 * No auth; verify signature using PAYMENT_WEBHOOK_SECRET (gateway secret)
 * Uses raw body for HMAC verification
 */
app.post('/api/payment/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(500).json({ error: "Webhook secret not configured" });

    const signature = req.headers['x-signature'] || req.headers['x-razorpay-signature'] || '';
    const raw = req.rawBody || JSON.stringify(req.body);

    // Example: HMAC SHA256 hex (depends on gateway)
    const expectedSig = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');
    if (signature !== expectedSig) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;

    // Example: update payments table
    // adjust according to your gateway event structure
    if (event && event.type === 'payment.succeeded') {
      const payload = event.data || event.payload;
      const paymentEntity = payload.payment || payload;
      const { payment_id, reservation_id, amount } = paymentEntity;

      const { error } = await supabaseAdmin
        .from('payments')
        .insert([{ payment_id, reservation_id, amount, status: 'success' }]);

      if (error) throw error;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// health
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`BookIt backend listening on port ${PORT}`);
});
