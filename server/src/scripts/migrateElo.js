const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Submission = require("../models/Submission");

const migrate = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error("❌ Lỗi: Không tìm thấy biến MONGO_URI trong file .env");
      process.exit(1);
    }

    console.log("⏳ Đang kết nối tới MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("✅ Kết nối Atlas thành công!");

    const students = await User.find({ role: "member" });
    console.log(`🔍 Tìm thấy ${students.length} học sinh để cập nhật...`);

    for (let student of students) {
      const allSubmissions = await Submission.find({
        student: student._id,
        status: "graded",
      });

      let totalElo = 0;
      let uniqueExams = 0;

      if (allSubmissions.length > 0) {
        const bestScoresMap = {};
        allSubmissions.forEach((sub) => {
          const examId = sub.exam.toString();
          const score = (sub.scoreAuto || 0) + (sub.scoreManual || 0);
          if (!bestScoresMap[examId] || score > bestScoresMap[examId]) {
            bestScoresMap[examId] = score;
          }
        });

        totalElo = Object.values(bestScoresMap).reduce((a, b) => a + b, 0);
        uniqueExams = Object.keys(bestScoresMap).length;
      }

      // const calculateRank = (elo) => {
      //   if (elo >= 9000) return "Chiến Thần";
      //   if (elo >= 7000) return "Thần Thoại";
      //   if (elo >= 5500) return "Huyền Thoại";
      //   if (elo >= 4400) return "Đại Cao Thủ";
      //   if (elo >= 3500) return "Cao Thủ";
      //   if (elo >= 2700) return "Tinh Anh";
      //   if (elo >= 2000) return "Đấu Sĩ";
      //   if (elo >= 1400) return "Dũng Sĩ";
      //   if (elo >= 900) return "Chiến Binh";
      //   if (elo >= 500) return "Thông Thạo";
      //   if (elo >= 200) return "Tập Sự";
      //   return "Sơ Nhập";
      // };

      const calculateRank = (elo) => {
        if (elo >= 500) return "Chiến Thần";
        if (elo >= 400) return "Thần Thoại";
        if (elo >= 320) return "Huyền Thoại";
        if (elo >= 250) return "Đại Cao Thủ";
        if (elo >= 190) return "Cao Thủ";
        if (elo >= 140) return "Tinh Anh";
        if (elo >= 100) return "Đấu Sĩ";
        if (elo >= 60) return "Dũng Sĩ";
        if (elo >= 30) return "Chiến Binh";
        if (elo >= 15) return "Thông Thạo";
        if (elo >= 5) return "Tập Sự";
        return "Sơ Nhập";
      };

      await User.findByIdAndUpdate(student._id, {
        $set: {
          elo: totalElo,
          rank: calculateRank(totalElo),
          totalSubmissions: allSubmissions.length,
          uniqueExamsCompleted: uniqueExams,
        },
      });
      console.log(
        `✨ Đã cập nhật: ${student.name} | ELO: ${totalElo} | Rank: ${calculateRank(totalElo)}`,
      );
    }

    console.log("🚀 MIGRATION HOÀN TẤT!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi Migration:", err);
    process.exit(1);
  }
};

migrate();
