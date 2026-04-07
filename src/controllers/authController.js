const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
}

const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw createHttpError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

module.exports = {
  register,
  login,
};
