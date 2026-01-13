const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const formatUserResponse = (user, token = null) => {
  const response = {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      createdAt: user.createdAt
    }
  };

  if (token) {
    response.token = token;
  }

  return response;
};

// ==================== CONTROLLERS ====================

// Register Controller
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check karein ki user pehle se exist to nahi karta
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ] 
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          error: 'Ye email pehle se registered hai' 
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          error: 'Ye username pehle se use ho raha hai' 
        });
      }
    }

    // Naya user create karo
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      balance: 100000
    });

    // Database mein save karo
    await user.save();

    // JWT token generate karo
    const token = generateToken(user._id, user.email);

    // Success response bhejo
    res.status(201).json({
      message: 'Account successfully banaya gaya!',
      ...formatUserResponse(user, token)
    });

  } catch (error) {
    console.error('Register Controller Error:', error);

    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `Ye ${field} pehle se use ho raha hai` 
      });
    }

    // Validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: messages[0] 
      });
    }

    res.status(500).json({ 
      error: 'Server error. Kripya phir se koshish karein.' 
    });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User ko email se dhundo
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Email ya password galat hai' 
      });
    }

    // Password verify karo
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Email ya password galat hai' 
      });
    }

    // JWT token generate karo
    const token = generateToken(user._id, user.email);

    // Success response bhejo
    res.json({
      message: 'Login successful!',
      ...formatUserResponse(user, token)
    });

  } catch (error) {
    console.error('Login Controller Error:', error);
    res.status(500).json({ 
      error: 'Server error. Kripya phir se koshish karein.' 
    });
  }
};

// Get Profile Controller
const getProfile = async (req, res) => {
  try {
    // req.user middleware se aa raha hai
    res.json(formatUserResponse(req.user));
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ 
      error: 'Profile fetch karne mein error' 
    });
  }
};

// Update Balance Controller
const updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;

    // User ko update karo
    req.user.balance = amount;
    await req.user.save();

    res.json({
      message: 'Balance successfully update ho gaya',
      balance: req.user.balance
    });

  } catch (error) {
    console.error('Update Balance Error:', error);
    res.status(500).json({ 
      error: 'Balance update karne mein error' 
    });
  }
};

// Logout Controller (Token invalidation frontend pe hogi)
const logout = async (req, res) => {
  try {
    // Token ko blacklist kar sakte hain (optional, advanced feature)
    // Abhi ke liye sirf success message bhejte hain
    
    res.json({
      message: 'Logout successful!'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ 
      error: 'Logout mein error' 
    });
  }
};

// Get User Stats Controller (Example of additional endpoint)
const getUserStats = async (req, res) => {
  try {
    const user = req.user;
    
    const stats = {
      userId: user._id,
      username: user.username,
      balance: user.balance,
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastUpdated: user.updatedAt
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ 
      error: 'Stats fetch karne mein error' 
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateBalance,
  logout,
  getUserStats
};