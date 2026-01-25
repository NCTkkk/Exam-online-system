import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { motion } from "framer-motion";
import {
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiOutlineLightningBolt,
  HiOutlineChevronRight,
  HiOutlineAcademicCap,
} from "react-icons/hi";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Animation variants cho các thẻ bài viết/chức năng
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER: Chào hỏi với phong cách hiện đại */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
              Chào mừng trở lại,
              <br />
              <span className="text-indigo-600 italic">
                {user?.name}
                <HiOutlineAcademicCap className="inline-block ml-2 mb-2 text-indigo-400" />
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">
              Sẵn sàng để chinh phục những thử thách mới hôm nay chưa?
            </p>
          </motion.div>

          {/* Quick Stats Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="text-center px-4">
              <p className="text-2xl font-black text-slate-800">12</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Đã làm
              </p>
            </div>
            <div className="w-px bg-slate-100 h-10 self-center"></div>
            <div className="text-center px-4">
              <p className="text-2xl font-black text-indigo-600">8.5</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Trung bình
              </p>
            </div>
          </motion.div>
        </div>

        {/* MAIN CHOICES: Hai lựa chọn lớn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Cột Làm đề thi */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -10 }}
            onClick={() => navigate("/exam-list")}
            className="group cursor-pointer bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
                <HiOutlineLightningBolt size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter uppercase">
                Làm đề thi mới
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed text-lg">
                Thử thách bản thân với hàng trăm đề thi từ các giáo viên. Rèn
                luyện kỹ năng và cải thiện điểm số.
              </p>
              <div className="mt-8 flex items-center text-indigo-600 font-black text-sm uppercase tracking-widest">
                Bắt đầu ngay{" "}
                <HiOutlineChevronRight
                  className="ml-2 group-hover:translate-x-2 transition-transform"
                  size={20}
                />
              </div>
            </div>
            {/* Trang trí nền */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
          </motion.div>

          {/* Cột Lịch sử */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -10 }}
            onClick={() => navigate("/view-results")}
            className="group cursor-pointer bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-800 hover:shadow-2xl hover:shadow-slate-300 transition-all relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform">
                <HiOutlineChartBar size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">
                Lịch sử bài làm
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed text-lg">
                Phân tích biểu đồ tiến bộ, xem lại các đáp án chi tiết để rút
                kinh nghiệm cho những lần sau.
              </p>
              <div className="mt-8 flex items-center text-emerald-400 font-black text-sm uppercase tracking-widest">
                Xem thống kê{" "}
                <HiOutlineChevronRight
                  className="ml-2 group-hover:translate-x-2 transition-transform"
                  size={20}
                />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
          </motion.div>
        </div>

        {/* TIP AREA: Mẹo học tập */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-4xl p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-xl shadow-indigo-100 gap-6"
        >
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
              <HiOutlineClipboardCheck size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                Mẹo học tập nhỏ
              </h3>
              <p className="text-indigo-100 font-medium">
                Xem lại đáp án sai giúp bạn nhớ kiến thức lâu hơn gấp{" "}
                <span className="text-white font-black underline">3 lần</span>{" "}
                đấy! Hãy tận dụng tính năng xem lại bài.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/leaderboard")}
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            Bảng xếp hạng 🏆
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
