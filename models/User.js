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
    minlength: [6, 'Password kam se kam 6 characters ka hona chahiye'],
    select: false
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

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

const User = mongoose.model('User', userSchema);

module.exports = User;