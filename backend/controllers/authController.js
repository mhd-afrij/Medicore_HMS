const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { findUserByUsername, createUser, findUserById } = require("../services/authService");
const { validateLogin, validateRegister } = require("../validators/authValidator");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

function generateToken(user) {
  console.log('authController.generateToken JWT_SECRET present:', typeof process.env.JWT_SECRET === 'string' && process.env.JWT_SECRET.length > 0);
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign(
    {
      userId: user.UserID,
      username: user.Username,
      role: user.Role
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

async function register(req, res, next) {
  try {
    const errors = validateRegister(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const existingUser = await findUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: "Username already exists" } });
    }

    const user = await createUser(req.body);
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          userId: user.UserID,
          username: user.Username,
          role: user.Role,
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const user = await findUserByUsername(req.body.username);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: "Invalid username or password" } });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.PasswordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: { message: "Invalid username or password" } });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      data: {
        token,
        user: {
          userId: user.UserID,
          username: user.Username,
          role: user.Role,
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function profile(req, res, next) {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  profile
};
