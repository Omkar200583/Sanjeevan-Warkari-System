const jwt = require('jsonwebtoken');

// Verify JWT token — attach user to req
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not logged in — please login first',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sanjeevan-secret-key');
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired — please login again',
    });
  }
};

// Allow only specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — ${req.user.role} role cannot access this`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };