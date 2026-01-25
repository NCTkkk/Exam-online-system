const router = require("express").Router();
const User = require("../models/User.js");
const { verifyToken, isAdmin } = require("../middlewares/auth.js");
const bcrypt = require("bcryptjs");

// 1. Lấy tất cả người dùng (Chỉ Admin mới xem được)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Lấy hết trừ mật khẩu
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Xóa người dùng (Chỉ Admin mới xóa được)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("Người dùng đã bị xóa");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. API Đổi mật khẩu (Cho trang Profile - Ai cũng dùng được cho chính mình)
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json("Mật khẩu cũ không chính xác");

    // Mã hóa mật khẩu mới và lưu
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json("Đổi mật khẩu thành công");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
