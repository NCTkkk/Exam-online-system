const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Kiểm tra thiếu dữ liệu
    if (!name || !email || !password) {
      return res.status(400).json("Vui lòng nhập đầy đủ thông tin");
    }

    // 2. Kiểm tra email trùng
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json("Email này đã được sử dụng");

    // 3. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo User mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "member",
    });

    const savedUser = await newUser.save();
    res.status(201).json("Đăng ký thành công!");
  } catch (err) {
    console.error("Lỗi Register:", err); // Xem lỗi chi tiết ở terminal server
    res.status(500).json("Lỗi hệ thống khi đăng ký");
  }
});

// API Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json("Sai email hoặc mật khẩu");

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json("Sai email hoặc mật khẩu");

    // Tạo mã Token để gửi về cho Client (Dùng để chứng minh đã đăng nhập)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ token, user: { name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
