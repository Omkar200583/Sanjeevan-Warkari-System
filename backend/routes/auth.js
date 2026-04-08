const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // ✅ FIX: Added missing import
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

console.log("✅ Auth routes loaded");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'sanjeevan-secret-key', { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobile, email, password, role } = req.body;

    if (!fullName || !mobile || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      fullName,
      mobile,
      email,
      password, // ✅ FIXED
      role: role || 'student'
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          email: user.email
        }
      }
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email or Mobile already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user: { id: user.id, fullName: user.fullName, role: user.role, email: user.email } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { id: user.id, fullName: user.fullName, role: user.role, email: user.email, mobile: user.mobile } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/students — Admin: all students
router.get('/students', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'fullName', 'email', 'mobile', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ FIX: Added protect middleware
// GET /api/auth/all-users — Admin: all users
router.get('/all-users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'mobile', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/forgot', async (req, res) => {
  const { email } = req.body;

  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetToken = otp;
  user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  // Send Email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    to: email,
    subject: 'Password Reset OTP',
    html: `<h2>Your OTP: ${otp}</h2>`
  });

  res.json({ success: true, message: 'OTP sent to email' });
});





router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.resetToken || user.resetToken !== otp || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10); // ✅ Now bcrypt is imported
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




module.exports = router;
