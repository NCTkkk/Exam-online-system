import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineCheckBadge,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineBookOpen,
} from "react-icons/hi2";

const LogoDesignLab = () => {
  const [activeColor, setActiveColor] = useState({
    name: "Indigo",
    from: "from-indigo-600",
    to: "to-violet-700",
    glow: "shadow-indigo-500/40",
    text: "text-indigo-500",
  });

  const colors = [
    {
      name: "Indigo",
      from: "from-indigo-600",
      to: "to-violet-700",
      glow: "shadow-indigo-500/40",
      text: "text-indigo-500",
    },
    {
      name: "Cyan",
      from: "from-cyan-500",
      to: "to-blue-600",
      glow: "shadow-cyan-500/40",
      text: "text-cyan-500",
    },
    {
      name: "Rose",
      from: "from-rose-500",
      to: "to-orange-600",
      glow: "shadow-rose-500/40",
      text: "text-rose-500",
    },
    {
      name: "Emerald",
      from: "from-emerald-500",
      to: "to-teal-600",
      glow: "shadow-emerald-500/40",
      text: "text-emerald-500",
    },
    {
      name: "Amber",
      from: "from-amber-400",
      to: "to-orange-500",
      glow: "shadow-amber-500/40",
      text: "text-amber-500",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-slate-200">
      {/* 1. NÚT QUAY LẠI */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span className="text-sm font-bold tracking-widest uppercase">
          Thoát
        </span>
      </Link>

      {/* 2. LOGO 2 (Góc dưới trái) */}
      <div className="absolute bottom-8 left-8 flex flex-col items-start gap-3 scale-[0.6] origin-bottom-left opacity-30 hover:opacity-100 transition-all duration-500 group/v2">
        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">
          Iteration 02
        </p>
        <div className="relative w-24 h-24 flex items-center justify-center border border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-white rounded-lg rotate-45 flex items-center justify-center shadow-lg">
              <span className="text-slate-900 font-black text-xl -rotate-45">
                O
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOGO 3 (History - ĐÃ KHÔI PHỤC CSS - Góc dưới phải) */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 scale-[0.5] origin-bottom-right opacity-30 hover:opacity-100 transition-all duration-500 group/v3">
        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">
          Iteration 03
        </p>
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Vòng xoay mờ - Đã khôi phục */}
          <div className="absolute inset-0 border-[2px] border-indigo-500/30 rounded-[3rem] rotate-12 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-0 border-[2px] border-slate-500/30 rounded-[3.5rem] -rotate-12 animate-[spin_15s_linear_infinite]"></div>

          {/* Khối Shield chính */}
          <div className="relative w-32 h-36 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-b-[2rem] rounded-t-lg shadow-[0_0_50px_rgba(79,70,229,0.5)] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
            <span className="text-white font-black text-7xl italic tracking-tighter transform -skew-x-6">
              G
            </span>
            {/* Hiệu ứng quét sáng */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[30deg] animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      {/* 4. BẢNG CHỈNH MÀU (Phải) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl z-50">
        {colors.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveColor(c)}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.from} ${c.to} transition-transform hover:scale-125 ${activeColor.name === c.name ? "ring-2 ring-white ring-offset-4 ring-offset-slate-950 scale-110" : ""}`}
          />
        ))}
      </div>

      {/* 5. LOGO 4 - TRUNG TÂM */}
      <div className="relative flex flex-col items-center group/v4">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div
            className={`absolute inset-0 border-2 border-dashed ${activeColor.text} opacity-20 rounded-[2.5rem] animate-[spin_20s_linear_infinite]`}
          ></div>

          <div
            className={`relative w-40 h-44 bg-gradient-to-br ${activeColor.from} ${activeColor.to} flex items-center justify-center shadow-[0_0_60px_-15px] ${activeColor.glow} transition-all duration-500 group-hover/v4:rotate-[10deg]`}
            style={{
              clipPath:
                "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
              <span className="text-white font-black text-8xl tracking-tighter drop-shadow-2xl z-10">
                G
              </span>
              <div className="absolute bottom-6 w-8 h-1 bg-white/40 rounded-full blur-[2px]"></div>
            </div>
            <div className="absolute -top-full left-0 w-full h-full bg-gradient-to-b from-transparent via-white/30 to-transparent group-hover/v4:top-full transition-all duration-700"></div>
          </div>
        </div>

        <p className="mt-16 text-slate-500 font-bold text-[10px] tracking-[0.4em] uppercase">
          Edition 04 • {activeColor.name} Theme
        </p>
      </div>

      {/* Background Decor */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      ></div>
    </div>

    // <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl px-8 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] flex items-center gap-6 md:gap-10 border border-white/10 transition-all hover:scale-105">
    //   <button className="text-slate-400 flex flex-col items-center gap-1 group hover:text-emerald-400 transition-all">
    //     <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
    //       <HiOutlineCheckBadge size={28} />
    //     </div>
    //     <span className="text-[9px] font-black uppercase tracking-tighter">
    //       Trắc nghiệm
    //     </span>
    //   </button>
    //   <div className="w-px h-10 bg-white/10 hidden md:block"></div>
    //   <button className="text-slate-400 flex flex-col items-center gap-1 group hover:text-blue-400 transition-all">
    //     <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
    //       <HiOutlineChatBubbleBottomCenterText size={28} />
    //     </div>
    //     <span className="text-[9px] font-black uppercase tracking-tighter">
    //       Tự luận
    //     </span>
    //   </button>
    //   <div className="w-px h-10 bg-white/10 hidden md:block"></div>
    //   <button className="text-slate-400 flex flex-col items-center gap-1 group hover:text-purple-400 transition-all">
    //     <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
    //       <HiOutlineBookOpen size={28} />
    //     </div>
    //     <span className="text-[9px] font-black uppercase tracking-tighter">
    //       Bài đọc
    //     </span>
    //   </button>

    //   <button className="">
    //     <div className=""></div>
    //     <span className=""></span>
    //   </button>
    // </div>
  );
};

export default LogoDesignLab;
