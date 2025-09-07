import jwt from 'jsonwebtoken';

// Middleware to authenticate JWT tokens
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token is required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware to check if user has admin role
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user has specific role
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        error: `${role} access required`
      });
    }
    next();
  };
};
