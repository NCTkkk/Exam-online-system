import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./context/AuthContext";
import { motion } from "framer-motion";
import {
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false); // Trạng thái ẩn/hiện mật khẩu cũ
  const [showNew, setShowNew] = useState(false); // Trạng thái ẩn/hiện mật khẩu mới
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/users/change-password",
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

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* CỘT TRÁI: THẺ THÔNG TIN CÁ NHÂN */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-linear-to-tr from-indigo-600 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100 mb-4">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {user?.name}
            </h2>
            <p className="text-slate-400 font-medium text-sm mb-4">
              {user?.email}
            </p>

            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                user?.role === "user"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {user?.role === "user" ? "Giáo viên" : "Học sinh"}
            </span>
          </div>

          <div className="bg-indigo-900 p-6 rounded-4xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                Trạng thái tài khoản
              </p>
              <p className="text-lg font-bold flex items-center gap-2">
                <HiOutlineShieldCheck className="text-emerald-400" size={24} />{" "}
                Đã bảo mật
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐỔI MẬT KHẨU */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                <HiOutlineLockClosed size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Bảo mật</h3>
                <p className="text-slate-400 text-sm font-medium">
                  Thay đổi mật khẩu định kỳ để an toàn hơn
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Mật khẩu cũ */}
              <div className="group">
                <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">
                  Mật khẩu cũ
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showOld ? (
                      <HiOutlineEyeOff size={20} />
                    ) : (
                      <HiOutlineEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div className="group">
                <label className="text-xs font-black text-slate-400 uppercase ml-2 mb-2 block">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showNew ? (
                      <HiOutlineEyeOff size={20} />
                    ) : (
                      <HiOutlineEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
              </motion.button>
            </form>

            {status.msg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-2xl text-sm font-bold text-center border ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {status.msg}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
