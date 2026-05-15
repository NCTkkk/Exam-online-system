const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "member"],
      default: "member",
    },
    elo: {
      type: Number,
      default: 0,
    },
    rank: {
      type: String,
      enum: [
        "Sơ Nhập",
        "Tập Sự",
        "Thông Thạo",
        "Chiến Binh",
        "Dũng Sĩ",
        "Đấu Sĩ",
        "Tinh Anh",
        "Cao Thủ",
        "Đại Cao Thủ",
        "Huyền Thoại",
        "Thần Thoại",
        "Chiến Thần",
      ],
      default: "Sơ Nhập",
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    uniqueExamsCompleted: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.model("User", UserSchema);
