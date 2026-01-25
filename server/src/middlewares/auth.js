const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Lấy sau chữ "Bearer"
  if (!token) return res.status(401).json("Bạn không có quyền truy cập");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json("Token hết hạn hoặc không hợp lệ");
  }
};

// Kiểm tra Role Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json("Chỉ Admin mới có quyền này");
};

// Kiểm tra Role User (Người ra đề)
const isTeacher = (req, res, next) => {
  if (req.user.role === "user" || req.user.role === "admin") next();
  else res.status(403).json("Chỉ người ra đề mới có quyền này");
};

module.exports = { verifyToken, isAdmin, isTeacher };
