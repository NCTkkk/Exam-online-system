import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
          <Link
            to={homePath}
            className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
          >
            Trang chủ
          </Link>

          <Link
            to="/leaderboard"
            className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
          >
            Bảng xếp hạng
          </Link>

          {/* Logic Học sinh (member) */}
          {user.role === "member" && (
            <>
              <Link
                to="/exam-list"
                className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
              >
                Làm đề thi
              </Link>
              <Link
                to="/view-results"
                className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
              >
                Kết quả của tôi
              </Link>
            </>
          )}

          {/* Logic Giáo viên (user) */}
          {user.role === "user" && (
            <>
              <Link
                to="/manage-exams"
                className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
              >
                Quản lý đề
              </Link>
              <Link
                to="/create-exam"
                className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
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
                className="text-gray-600 hover:text-indigo-600 font-bold text-sm transition"
              >
                Quản trị hệ thống
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* --- KHỐI USER & DROPDOWN MENU --- */}
        <div className="relative">
          <div
            className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition group"
            onClick={() => setIsMenuOpen(!isMenuOpen)} // Click để hiện danh mục
          >
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
              {user.role === "member"
                ? "Học sinh"
                : user.role === "admin"
                  ? "Quản trị"
                  : "Giáo viên"}
            </p>
            <p className="text-sm font-bold text-slate-700 flex items-center justify-end gap-1">
              {user.name}{" "}
              <span
                className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
              >
                ⚙️
              </span>
            </p>
          </div>

          {/* Danh mục hiện ra khi click vào Icon/Tên */}
          {/* Danh mục hiện ra khi click vào Icon/Tên */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[60] animate-in fade-in zoom-in duration-200">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                👤 Trang cá nhân
              </Link>

              <hr className="my-1 border-gray-50" />

              <Link
                to="/activity-log"
                className="block px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-gray-50 hover:text-indigo-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                🕒 Nhật ký hoạt động
              </Link>

              <Link
                to="/ui-settings"
                className="block px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-gray-50 hover:text-indigo-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                🎨 Thiết lập giao diện
              </Link>

              {/* Mục thứ 3 dự phòng - tạm thời để trống hoặc ẩn đi */}
              <button className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-300 cursor-not-allowed">
                🔒 Tính năng sắp ra mắt
              </button>
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
