const router = require("express").Router();
const userController = require("../controllers/user.js");
const { verifyToken, isAdmin } = require("../middlewares/auth.js");

// 1. Lấy tất cả người dùng (Chỉ Admin mới xem được)
router.get("/", verifyToken, isAdmin, userController.getAllUsers);

// 2. Xóa người dùng (Chỉ Admin mới xóa được)
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

// 3. API Đổi mật khẩu (Cho trang Profile - Ai cũng dùng được cho chính mình)
router.put("/change-password", verifyToken, userController.changePassword);

module.exports = router;
