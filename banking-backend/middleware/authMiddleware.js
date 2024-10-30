const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  // Extract the token from the 'Authorization' header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  // Verify the token using the JWT secret
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Attach the user information (decoded from the token) to the request object
    req.user = decoded;  
    next();  // Proceed to the next middleware or route handler
  });
};
