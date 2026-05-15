const User = require("../models/User");
const bcrypt = require("bcryptjs");

// API lấy danh sách cho Đường Đua Danh Hiệu
const getTrophyRoad = async (req, res) => {
  try {
    // Chỉ lấy những người có role là 'member' (học sinh)
    // Sắp xếp theo ELO từ cao đến thấp
    const players = await User.find({ role: "member" })
      .select("name avatar elo rank totalSubmissions uniqueExamsCompleted")
      .sort({ elo: -1 });

    res.status(200).json(players);
  } catch (error) {
    console.error("Lỗi getTrophyRoad:", error);
    res.status(500).json("Lỗi server khi lấy dữ liệu đường đua");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("Người dùng đã bị xóa");
  } catch (error) {
    res.status(500).json(err);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.body.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json("Mật khẩu cũ không chính xác");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json("Đổi mật khẩu thành công");
  } catch (error) {
    res.status(500).json(err);
  }
};

// Lấy thống kê cá nhân cho trang Profile
const getProfileStats = async (req, res) => {
  try {
    // req.user.id lấy từ middleware verifyToken
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json("Người dùng không tồn tại");

    // Trả về các thông số cần thiết cho Frontend
    res.json({
      elo: user.elo || 0,
      rank: user.rank || "Sơ Nhập",
      uniqueExamsCompleted: user.uniqueExamsCompleted || 0,
      totalSubmissions: user.totalSubmissions || 0,
    });
  } catch (err) {
    res.status(500).json("Lỗi máy chủ khi lấy thống kê");
  }
};

module.exports = {
  getTrophyRoad,
  getAllUsers,
  deleteUser,
  changePassword,
  getProfileStats,
};
