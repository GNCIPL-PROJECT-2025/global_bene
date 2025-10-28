const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authRequired = async (req, res, next) => {
  try {
    //  Get token from header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid format' });
    }

    const token = authHeader.split(' ')[1];

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Check if user still exists in DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found or removed' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};
