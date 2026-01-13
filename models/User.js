const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username zaroori hai'],
    unique: true,
    trim: true,
    minlength: [3, 'Username kam se kam 3 characters ka hona chahiye'],
    maxlength: [30, 'Username 30 characters se zyada nahi ho sakta']
  },
  email: {
    type: String,
    required: [true, 'Email zaroori hai'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Valid email address enter karein']
  },
  password: {
    type: String,
    required: [true, 'Password zaroori hai'],
    minlength: [6, 'Password kam se kam 6 characters ka hona chahiye']
  },
  balance: {
    type: Number,
    default: 100000,
    min: [0, 'Balance negative nahi ho sakta']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Password hashing middleware - save se pehle
userSchema.pre('save', async function(next) {
  // Agar password modify nahi hua to skip karo
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Salt generate karo
    const salt = await bcrypt.genSalt(10);
    
    // Password ko hash karo
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// User object ko JSON mein convert karte waqt password hide karo
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method - email se user dhundo
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method - username se user dhundo
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

const User = mongoose.model('User', userSchema);

module.exports = User;