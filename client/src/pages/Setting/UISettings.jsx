import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineLanguage,
  HiOutlineSwatch,
} from "react-icons/hi2";

const UISettings = () => {
  // Giả định các state (Sau này sẽ đưa vào Context hoặc LocalStorage)
  const [fontSize, setFontSize] = useState("medium");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Thiết lập giao diện 🎨
        </h1>
        <p className="text-slate-500 font-medium">
          Tùy chỉnh không gian học tập theo cách bạn muốn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD: DARK MODE */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              {darkMode ? (
                <HiOutlineMoon size={24} />
              ) : (
                <HiOutlineSun size={24} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Chế độ hiển thị</h3>
              <p className="text-xs text-slate-400">
                Thay đổi giữa nền sáng và tối
              </p>
            </div>
          </div>

          {/* Nút bấm điều khiển */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full py-3 rounded-2xl font-bold transition-all ${
              darkMode
                ? "bg-amber-400 text-slate-900" // Màu vàng nắng khi đang ở mode tối
                : "bg-slate-800 text-white" // Màu tối khi đang ở mode sáng
            }`}
          >
            {darkMode
              ? "☀️ Chuyển sang Chế độ Sáng"
              : "🌙 Chuyển sang Chế độ Tối"}
          </button>
        </motion.div>

        {/* CARD: FONT SIZE */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <HiOutlineLanguage size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Kích thước chữ</h3>
              <p className="text-xs text-slate-400">
                Điều chỉnh độ lớn của nội dung bài thi
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  fontSize === size
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                {size === "small" ? "Nhỏ" : size === "medium" ? "Vừa" : "Lớn"}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Thông báo trang đang phát triển */}
      <div className="mt-10 p-8 bg-indigo-50/50 border border-dashed border-indigo-200 rounded-[2rem] text-center">
        <p className="text-indigo-400 font-bold text-sm">
          Các tùy chọn về màu sắc và bố cục sẽ sớm được cập nhật!
        </p>
      </div>
    </div>
  );
};

export default UISettings;
