exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

exports.requireUser = (req, res, next) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ message: 'User access required' });
  }

  next();
};
