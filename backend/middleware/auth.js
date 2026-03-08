const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'climate_crop_secret_2024_namma_uzhavan';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. Invalid token format.' 
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid or expired token.' 
    });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
    } catch (err) {
      // Token invalid, continue without user
    }
  }
  next();
};

module.exports = { authMiddleware, optionalAuth, JWT_SECRET };
