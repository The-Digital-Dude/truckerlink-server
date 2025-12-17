const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

const generateToken = userId => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, 'User with this email already exists'));
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'user',
    });

    const token = generateToken(user._id);

    successResponse(res, 201, 'User registered successfully', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Account is inactive'));
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    const userResponse = user.toJSON();

    successResponse(res, 200, 'Login successful', {
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  try {
    successResponse(res, 200, 'User profile retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
