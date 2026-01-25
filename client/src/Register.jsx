import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineAcademicCap, // Icon cho học sinh
  HiOutlineBriefcase, // Icon cho giáo viên
} from "react-icons/hi";
import { FaGoogle, FaFacebookF, FaInstagram } from "react-icons/fa6";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("🎉 Chúc mừng! Đăng ký thành công.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Blobs đồng bộ */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 w-full max-w-xl"
      >
        <motion.div {...fadeInUp} className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Tạo tài khoản
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Gia nhập cộng đồng học tập thông minh
          </p>
        </motion.div>

        {/* SOCIAL REGISTER QUICK OPTIONS */}
        <div className="flex justify-center gap-4 mb-8">
          <SocialSmallButton
            icon={<FaGoogle />}
            color="hover:text-red-500 hover:bg-red-50"
          />
          <SocialSmallButton
            icon={<FaFacebookF />}
            color="hover:text-blue-600 hover:bg-blue-50"
          />
          <SocialSmallButton
            icon={<FaInstagram />}
            color="hover:text-pink-500 hover:bg-pink-50"
          />
        </div>

        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-full border-t border-slate-100"></div>
          <span className="relative flex items-center gap-1 bg-white/0 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Hoặc đăng ký tài khoản
            <span className="ml-1 flex items-center gap-1 rounded-md bg-linear-to-r from-indigo-50 to-purple-50 px-2 py-0.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
                G
              </span>
              <span className="text-indigo-600 tracking-wider">onlinetest</span>
            </span>
          </span>
        </div>

        <form
          onSubmit={handleRegister}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
        >
          {/* Name */}
          <div className="md:col-span-2 group">
            <div className="relative">
              <HiOutlineUser
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-700"
                placeholder="Họ và tên"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2 group">
            <div className="relative">
              <HiOutlineMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-700"
                placeholder="Email cá nhân"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password */}
          <div className="md:col-span-2 group">
            <div className="relative">
              <HiOutlineLockClosed
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-slate-700"
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Role Selection - Giao diện mới */}
          <div className="md:col-span-2 mt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-3 block">
              Bạn đăng ký với tư cách:
            </label>
            <div className="flex gap-4">
              <RoleCard
                active={formData.role === "member"}
                onClick={() => setFormData({ ...formData, role: "member" })}
                icon={<HiOutlineAcademicCap size={24} />}
                label="Học sinh"
              />
              <RoleCard
                active={formData.role === "user"}
                onClick={() => setFormData({ ...formData, role: "user" })}
                icon={<HiOutlineBriefcase size={24} />}
                label="Giáo viên"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="md:col-span-2 w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all mt-6 disabled:opacity-50"
          >
            {loading ? "ĐANG TẠO..." : "TẠO TÀI KHOẢN NGAY"}
          </motion.button>
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-black hover:underline ml-1"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

// Component con cho các nút Social nhỏ
const SocialSmallButton = ({ icon, color }) => (
  <motion.button
    whileHover={{ y: -3, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 shadow-sm transition-all ${color}`}
  >
    {icon}
  </motion.button>
);

// Component con cho card chọn Role
const RoleCard = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold border-2 transition-all ${
      active
        ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
        : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200"
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

export default Register;
