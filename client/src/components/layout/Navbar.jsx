import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  HiChevronDown,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineSwatch,
  HiOutlineLockClosed,
  HiOutlineArrowLeftOnRectangle,
} from "react-icons/hi2";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const homePath =
    user.role === "member" ? "/student-dashboard" : "/teacher-dashboard";

  const activityLogPath =
    user?.role === "member" ? "/activity-log" : "/teacher-activity";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 p-4 mb-6 flex justify-between items-center px-10 sticky top-0 z-50">
      <div className="flex gap-10 items-center">
        {/* --- LOGO G + ONLINETEST --- */}
        <Link to={homePath} className="flex items-center group">
          <div className="flex items-center">
            {/* Khối chữ G nổi bật */}
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform duration-300">
              <span className="text-white text-2xl font-black italic">G</span>
            </div>
            {/* Chữ ONLINE TEST đẹp hơn */}
            <div className="ml-3 flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">
                <span className="text-indigo-600">ONLINE</span>
                <span className="text-slate-800 font-extrabold ml-0.5">
                  TEST
                </span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1">
                Platform
              </span>
            </div>
          </div>
        </Link>

        {/* --- CÁC CHỨC NĂNG THEO ROLE (GIỮ NGUYÊN LOGIC CỦA BẠN) --- */}
        <div className="flex gap-6 border-l pl-8 border-gray-100 items-center">
          {/* Logic Học sinh (member) */}
          {user.role === "member" && (
            <>
              <Link
                to={homePath}
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Trang chủ
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Bảng xếp hạng
              </Link>
              <Link
                to="/exam-list"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Làm đề thi
              </Link>
              <Link
                to="/view-results"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Kết quả của tôi
              </Link>
            </>
          )}

          {/* Logic Giáo viên (user) */}
          {user.role === "user" && (
            <>
              <Link
                to={homePath}
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Trang chủ
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Bảng xếp hạng
              </Link>
              <Link
                to="/manage-exams"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Quản lý đề
              </Link>
              <Link
                to="/create-exam"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Tạo đề mới
              </Link>
            </>
          )}
          {/* Logic Quản trị viên (admin) */}
          {user.role === "admin" && (
            <>
              <Link
                to="/Admin-dashboard"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Quản trị hệ thống
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-600 hover:text-indigo-600 font-bold text-base transition"
              >
                Bảng xếp hạng
              </Link>
            </>
          )}

          {/* 1. Link chung cho cả User & Member: Đường đua danh hiệu */}
          {(user.role === "member" || user.role === "user") && (
            <Link
              to="/trophy-road"
              className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 font-bold text-sm transition flex items-center gap-1.5 border border-amber-100"
            >
              <span>🏆</span> Đường đua
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* --- KHỐI USER & DROPDOWN MENU --- */}
        <div className="relative">
          <div
            className="flex items-center gap-3 px-3 py-1.5 rounded-2xl hover:bg-slate-100 transition-all duration-200 cursor-pointer group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {/* 1. Phần Text (Căn phải) */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-extrabold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                {user.name}
              </p>
              <p
                className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${
                  user.role === "admin"
                    ? "bg-red-50 text-red-600"
                    : user.role === "teacher"
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {user.role === "member"
                  ? "Học sinh"
                  : user.role === "admin"
                    ? "Quản trị"
                    : "Giáo viên"}
              </p>
            </div>

            {/* 2. Avatar (Điểm nhấn thiết kế) */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white">
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* 3. Icon Mũi tên */}
              <div
                className={`absolute -bottom-1 -right-1 bg-white rounded-full shadow-sm border border-slate-100 p-0.5 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
              >
                <HiChevronDown size={12} className="text-slate-500" />
              </div>
            </div>
          </div>

          {/* Danh mục hiện ra khi click vào Icon/Tên */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-57 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[60] animate-in fade-in zoom-in duration-200 origin-top-right overflow-hidden">
              {/* Link 1: Trang cá nhân - Không dùng mx-2 để hover full chiều ngang */}
              <Link
                to="/profile"
                className="flex items-center gap-4 px-5 py-1.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg w-6 flex justify-center">👤</span>
                <span>Trang cá nhân</span>
              </Link>

              <div className="border-t border-gray-50" />

              {/* Link 2: Nhật ký hoạt động */}
              <Link
                to={activityLogPath}
                className="flex items-center gap-4 px-5 py-1.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg w-6 flex justify-center">🕒</span>
                <span>Nhật ký hoạt động</span>
              </Link>

              {/* Link 3: Thiết lập giao diện */}
              <Link
                to="/ui-settings"
                className="flex items-center gap-4 px-5 py-1.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg w-6 flex justify-center">🎨</span>
                <span>Thiết lập giao diện</span>
              </Link>

              {/* Mục dự phòng: Sắp ra mắt */}
              <div className="border-t border-gray-50">
                <button className="w-full flex items-center gap-4 px-5 py-1.5 text-sm font-semibold text-slate-300 cursor-not-allowed">
                  <span className="text-lg w-6 flex justify-center opacity-50">
                    🔒
                  </span>
                  <span>Tính năng sắp ra mắt</span>
                </button>
              </div>
            </div>
          )}

          {/* Lớp phủ để đóng menu khi click ra ngoài */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 z-[55]"
              onClick={() => setIsMenuOpen(false)}
            ></div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm border border-red-100"
        >
          Đăng xuất
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
