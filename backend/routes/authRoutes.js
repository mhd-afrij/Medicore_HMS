const express = require("express");
const { login, profile } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/profile", authenticateToken, profile);

module.exports = router;
