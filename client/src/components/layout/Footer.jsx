import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Grid 3 cột để đảm bảo Copyright luôn nằm chính giữa tuyệt đối */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* CỘT 1: LOGO (Căn trái) */}
          <div className="flex justify-center md:justify-start items-center group cursor-default">
            <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-600 transition-all duration-300 group-hover:rotate-3">
              <span className="text-white text-[11px] font-black italic">
                G
              </span>
            </div>
            <div className="ml-2.5 flex flex-col leading-none">
              <span className="text-[10px] font-black tracking-tight text-slate-800 uppercase">
                Online<span className="text-indigo-600">Test</span>
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                v2.0
              </span>
            </div>
          </div>

          {/* CỘT 2: COPYRIGHT (Căn giữa - Giữ nguyên theo ý bạn) */}
          <div className="flex justify-center items-center">
            <p className="text-[11px] font-medium text-slate-400 tracking-wide bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100/50">
              © {new Date().getFullYear()}{" "}
              <span className="text-slate-700 font-bold">G-Platform</span>. All
              rights reserved.
            </p>
          </div>

          {/* CỘT 3: LINKS & STATUS (Căn phải) */}
          <div className="flex justify-center md:justify-end items-center gap-5">
            <nav className="flex items-center gap-4">
              <a
                href="#"
                className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                Hỗ trợ
              </a>
              <div className="w-1 h-1 rounded-full bg-indigo-200"></div>
              <a
                href="#"
                className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                Điều khoản
              </a>
            </nav>
            {/* Điểm nhấn nhỏ: Status Dot - Giờ đã có thể bấm được */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
              <Link
                to="/design-lab"
                title="Logo Design Lab"
                className="relative flex h-3 w-3 group/dot cursor-pointer transition-transform hover:scale-125"
              >
                {/* Vòng tròn nháy phía ngoài */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>

                {/* Chấm tròn chính - Đổi sang Indigo cho đồng bộ với mong muốn vẽ logo mới */}
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 shadow-sm shadow-indigo-200 group-hover/dot:bg-indigo-500"></span>

                {/* Một tooltip nhỏ hiện ra khi hover (tùy chọn) */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover/dot:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-tighter font-bold">
                  Design Lab
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
