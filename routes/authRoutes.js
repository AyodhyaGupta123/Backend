const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateBalance,
} = require("../controllers/authController");

const auth = require("../middleware/auth");  // middleware (without 's')
const {
  validateRegister,
  validateLogin,
  validateBalance,
} = require("../middleware/validation");  // middleware (without 's')

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Protected routes
router.get("/profile", auth, getProfile);
router.patch("/balance", auth, validateBalance, updateBalance);

module.exports = router;