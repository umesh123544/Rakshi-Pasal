module.exports = function(req, res, next) {
  if (req.method === 'GET') {
    return next();
  }
  
  // For non-GET methods, check authentication
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};