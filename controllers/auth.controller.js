const User = require("../models/User.model");

exports.register = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, user });
};
