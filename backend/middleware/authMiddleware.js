const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: "Authentication token is required" }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid or expired token" }
      });
    }

    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied: insufficient permissions" }
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
