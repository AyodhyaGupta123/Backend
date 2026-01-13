const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - token verify karta hai
const authMiddleware = async (req, res, next) => {
  try {
    // Header se token nikalo
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authentication token nahi mila. Pehle login karein.' 
      });
    }

    // "Bearer TOKEN" format se token extract karo
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Invalid token format' 
      });
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Database se user dhundo
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        error: 'User nahi mila. Token invalid hai.' 
      });
    }

    // User ko request object mein attach karo
    req.user = user;
    req.userId = decoded.userId;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token. Phir se login karein.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expire ho gaya hai. Phir se login karein.' 
      });
    }

    console.error('Auth Middleware Error:', error);
    res.status(500).json({ 
      error: 'Authentication mein problem aayi' 
    });
  }
};

// Optional authentication - agar token hai to verify karo, nahi to bhi chalne do
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
      req.user = user;
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Error ko ignore karo aur aage badho
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};