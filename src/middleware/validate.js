const validator = require('validator');

const VALID_USER_TYPES = ['Hardware Owner', 'Compute Consumer', 'Both'];

function validateSignup(req, res, next) {
  const { fullName, email, userType, alphaBetaOptin } = req.body;
  const errors = [];

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2)
    errors.push('full_name must be at least 2 characters');
  if (fullName && fullName.trim().length > 200)
    errors.push('full_name must be 200 characters or fewer');
  if (!email || !validator.isEmail(String(email)))
    errors.push('A valid email address is required');
  if (!userType || !VALID_USER_TYPES.includes(userType))
    errors.push(`user_type must be one of: ${VALID_USER_TYPES.join(', ')}`);
  if (alphaBetaOptin !== undefined && typeof alphaBetaOptin !== 'boolean')
    errors.push('alpha_beta_optin must be a boolean');

  if (errors.length > 0)
    return res.status(422).json({ success: false, errors });

  next();
}

module.exports = { validateSignup };
