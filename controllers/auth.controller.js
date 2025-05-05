const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    expires: new Date('9999-12-31')
  };

  res.status(200).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      address: user.address,
    }
  });
};

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    sendTokenResponse(user, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  user.lastLogin = new Date();
  await user.save();

  sendTokenResponse(user, res);
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};