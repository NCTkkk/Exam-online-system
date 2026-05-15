import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineFire,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import {
  Trophy,
  Star,
  Medal,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

// Tận dụng lại bảng màu Rank từ TrophyRoad
const rankConfigs = {
  "Sơ Nhập": { color: "from-slate-400 to-slate-500", icon: <Star size={18} /> },
  "Tập Sự": { color: "from-blue-400 to-blue-500", icon: <Star size={18} /> },
  "Thông Thạo": {
    color: "from-cyan-400 to-cyan-500",
    icon: <Star size={18} />,
  },
  "Chiến Binh": {
    color: "from-emerald-400 to-emerald-500",
    icon: <Medal size={18} />,
  },
  "Dũng Sĩ": {
    color: "from-green-500 to-green-600",
    icon: <Medal size={18} />,
  },
  "Đấu Sĩ": {
    color: "from-yellow-500 to-yellow-600",
    icon: <Medal size={18} />,
  },
  "Tinh Anh": {
    color: "from-indigo-500 to-indigo-600",
    icon: <Trophy size={18} />,
  },
  "Cao Thủ": {
    color: "from-purple-500 to-purple-600",
    icon: <Trophy size={18} />,
  },
  "Đại Cao Thủ": {
    color: "from-pink-500 to-pink-600",
    icon: <Trophy size={18} />,
  },
  "Huyền Thoại": {
    color: "from-orange-500 to-red-600",
    icon: <HiOutlineFire size={18} />,
  },
  "Thần Thoại": {
    color: "from-red-600 to-rose-700",
    icon: <HiOutlineFire size={18} />,
  },
  "Chiến Thần": {
    color: "from-yellow-400 via-orange-500 to-red-600 animate-pulse",
    icon: <HiOutlineFire size={20} />,
  },
};

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  // State bổ sung cho học sinh
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    // Chỉ lấy thống kê nếu là học sinh (role !== "user")
    if (user && user.role !== "user") {
      const fetchMyStats = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            "https://exam-online-system-p6yp.onrender.com/api/users/profile-stats",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setStudentData(res.data);
        } catch (err) {
          console.error("Không lấy được thống kê học tập");
        }
      };
      fetchMyStats();
    }
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://exam-online-system-p6yp.onrender.com/api/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus({ type: "success", msg: "Đổi mật khẩu thành công!" });
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data || "Lỗi khi đổi mật khẩu",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentRank = studentData?.rank || "Sơ Nhập";
  const config = rankConfigs[currentRank] || rankConfigs["Sơ Nhập"];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* CỘT TRÁI (3/12): THÔNG TIN CƠ BẢN */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white flex flex-col items-center text-center">
            <div
              className={`w-24 h-24 bg-gradient-to-tr ${config.color} rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl mb-4`}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight line-clamp-1">
              {user?.name}
            </h2>
            <p className="text-slate-400 font-medium text-xs mb-4 truncate w-full">
              {user?.email}
            </p>

            <span
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user?.role === "user"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {user?.role === "user" ? "Giáo viên" : "Học sinh"}
            </span>
          </div>

          {/* Widget trạng thái bảo mật (Dùng chung) */}
          <div className="bg-indigo-900 p-6 rounded-4xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                Tài khoản
              </p>
              <p className="text-lg font-bold flex items-center gap-2">
                <HiOutlineShieldCheck className="text-emerald-400" size={24} />{" "}
                Đã bảo mật
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* CỘT GIỮA (Học sinh: Thống kê | Giáo viên: Ẩn) */}
        {user?.role !== "user" && (
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <HiOutlineTrendingUp className="text-indigo-500" /> TIẾN ĐỘ HỌC
                TẬP
              </h3>

              {/* Chỉ số ELO lớn */}
              <div
                className={`rounded-3xl p-6 text-white bg-gradient-to-br ${config.color} shadow-lg mb-6`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold opacity-80 uppercase">
                      Hạng hiện tại
                    </p>
                    <p className="text-2xl font-black italic flex items-center gap-2">
                      {config.icon} {currentRank.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold opacity-80 uppercase">
                      Tổng ELO
                    </p>
                    <p className="text-4xl font-black">
                      {studentData?.elo?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {/* Progress Bar tới Rank tiếp theo */}
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                    <span>Tiến trình hạng</span>
                    <span>{Math.round((studentData?.elo % 1000) / 10)}%</span>
                  </div>
                  <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${(studentData?.elo % 1000) / 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Grid thông số nhỏ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <ClipboardCheck className="text-indigo-500 mb-2" size={20} />
                  <p className="text-2xl font-black text-slate-800">
                    {studentData?.uniqueExamsCompleted || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Đề đã hoàn thành
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <GraduationCap className="text-emerald-500 mb-2" size={20} />
                  <p className="text-2xl font-black text-slate-800">
                    {studentData?.totalSubmissions || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Tổng lượt thi
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CỘT CUỐI (Giáo viên: 9/12 | Học sinh: 4/12): ĐỔI MẬT KHẨU */}
        <div
          className={user?.role === "user" ? "md:col-span-9" : "md:col-span-4"}
        >
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white h-full">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <HiOutlineLockClosed className="text-slate-600" /> BẢO MẬT
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">
                  Mật khẩu cũ
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showOld ? (
                      <HiOutlineEyeOff size={18} />
                    ) : (
                      <HiOutlineEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNew ? (
                      <HiOutlineEyeOff size={18} />
                    ) : (
                      <HiOutlineEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-sm shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50"
              >
                {loading ? "ĐANG LƯU..." : "CẬP NHẬT MẬT KHẨU"}
              </motion.button>
            </form>

            {status.msg && (
              <div
                className={`mt-4 p-3 rounded-xl text-[10px] font-black text-center border ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {status.msg.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
