const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. Đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra thiếu dữ liệu
    if (!name || !email || !password) {
      return res.status(400).json("Vui lòng nhập đầy đủ thông tin");
    }

    // Kiểm tra email trùng
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json("Email này đã được sử dụng");

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo User mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "member",
    });

    await newUser.save();
    res.status(201).json("Đăng ký thành công!");
  } catch (err) {
    console.error("Lỗi Register:", err);
    res.status(500).json("Lỗi hệ thống khi đăng ký");
  }
};

// 2. Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("Sai email hoặc mật khẩu");

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Sai email hoặc mật khẩu");

    // Tạo Token (JWT)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Trả về token và thông tin cơ bản của user
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  register,
  login,
};
