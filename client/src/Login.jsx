import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import {
  FaGoogle,
  FaFacebookF,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa6"; // Import thêm icon social
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      login(res.data);
      const userRole = res.data.user.role;
      if (userRole === "user") navigate("/teacher-dashboard");
      else if (userRole === "admin") navigate("/admin-dashboard");
      else navigate("/student-dashboard");
    } catch (err) {
      alert(err.response?.data || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };
  // Component con xử lý các nút Social - Đã sửa lỗi link
  const SocialButton = ({ icon, color, link }) => (
    <motion.a
      href={link}
      target="_blank" // Mở link trong tab mới
      rel="noopener noreferrer" // Bảo mật khi mở link bên ngoài
      whileHover={{ y: -5, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm transition-all cursor-pointer ${color}`}
    >
      {icon}
    </motion.a>
  );

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Blobs giữ nguyên */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 3, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="flex justify-center mb-6"
        >
          <div className="w-14 h-14 bg-linear-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
            <span className="text-white text-3xl font-black">G</span>
          </div>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Chào mừng!
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Đăng nhập để bắt đầu học tập
          </p>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Inputs giữ nguyên logic của bạn */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="group"
          >
            <div className="relative">
              <HiOutlineMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                placeholder="Email của bạn"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.5 }}
            className="group"
          >
            <div className="relative">
              <HiOutlineLockClosed
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                placeholder="Mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.button
            {...fadeInUp}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all disabled:opacity-50"
          >
            {loading ? "ĐANG TẢI..." : "ĐĂNG NHẬP"}
          </motion.button>
        </form>

        {/* --- PHẦN SOCIAL LOGIN MỚI --- */}
        <motion.div {...fadeInUp} transition={{ delay: 0.7 }} className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-full border-t border-slate-200"></div>
            <span className="relative bg-white/0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">
              Hoặc đăng nhập bằng
            </span>
          </div>

          <div className="flex justify-center gap-4">
            <SocialButton
              icon={<FaGoogle size={20} />}
              color="hover:text-red-500 hover:bg-red-50"
              link="https://www.google.com"
            />
            <SocialButton
              icon={<FaFacebookF size={20} />}
              color="hover:text-blue-600 hover:bg-blue-50"
              link="https://facebook.com"
            />
            <SocialButton
              icon={<FaInstagram size={20} />}
              color="hover:text-pink-500 hover:bg-pink-50"
              link="https://instagram.com"
            />
            <SocialButton
              icon={<FaEnvelope size={20} />}
              color="hover:text-indigo-500 hover:bg-indigo-50"
              link="https://accounts.google.com/Login?btmpl=mobile_tier2&hl=vi&service=mail"
            />
          </div>
        </motion.div>
        {/* ---------------------------- */}

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-slate-100 text-center"
        >
          <p className="text-slate-500 font-medium text-sm">
            Chưa có tài khoản?
            <Link
              to="/register"
              className="text-indigo-600 font-black ml-2 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Component con cho các nút Social để code gọn hơn
const SocialButton = ({ icon, color }) => (
  <motion.button
    whileHover={{ y: -4, scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className={`w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm transition-all ${color}`}
  >
    {icon}
  </motion.button>
);

export default Login;
