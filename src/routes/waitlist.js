const express = require('express');
const rateLimit = require('express-rate-limit');
const { validateSignup } = require('../middleware/validate');
const { insertSignup, getCount, emailExists, getBreakdown } = require('../db/queries');

const router = express.Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please try again later.' },
});

// GET /api/waitlist/count
router.get('/count', async (_req, res) => {
  try {
    const count = await getCount();
    res.json({ success: true, count: Number(count) });
  } catch (err) {
    console.error('GET /count error:', err.message);
    res.status(500).json({ success: false, error: 'Could not retrieve count' });
  }
});

// GET /api/waitlist/breakdown
router.get('/breakdown', async (_req, res) => {
  try {
    const breakdown = await getBreakdown();
    res.json({ success: true, breakdown });
  } catch (err) {
    console.error('GET /breakdown error:', err.message);
    res.status(500).json({ success: false, error: 'Could not retrieve breakdown' });
  }
});

// POST /api/waitlist
router.post('/', signupLimiter, validateSignup, async (req, res) => {
  const { fullName, email, userType, alphaBetaOptin = false } = req.body;
  try {
    const exists = await emailExists(email);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: 'This email is already on the waitlist.',
      });
    }

    const signup = await insertSignup({
      fullName: fullName.trim(),
      email,
      userType,
      alphaBetaOptin,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'] || null,
    });

    const count = await getCount();

    return res.status(201).json({
      success: true,
      message: 'Successfully added to the waitlist!',
      data: {
        id: signup.id,
        fullName: signup.full_name,
        email: signup.email,
        userType: signup.user_type,
        alphaBetaOptin: signup.alpha_beta_optin,
        createdAt: signup.created_at,
      },
      totalCount: Number(count),
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'This email is already on the waitlist.',
      });
    }
    console.error('POST /waitlist error:', err.message);
    res.status(500).json({ success: false, error: 'Could not save signup — please try again.' });
  }
});

module.exports = router;
