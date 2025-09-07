import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock user database (in production, use a real database)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@samplesense.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: null
  },
  {
    id: 2,
    username: 'demo',
    email: 'demo@samplesense.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'user',
    createdAt: new Date('2024-01-01'),
    lastLogin: null
  }
];

// @route   POST /login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user data and token
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login'
    });
  }
});

// @route   POST /register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      lastLogin: null
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        username: newUser.username,
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration'
    });
  }
});

// @route   GET /profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// @route   POST /logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    message: 'Logout successful'
  });
});

// @route   POST /refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Generate new JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error during token refresh'
    });
  }
});

export default router;
