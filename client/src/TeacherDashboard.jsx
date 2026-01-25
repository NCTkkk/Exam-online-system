import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { motion } from "framer-motion";
import {
  HiOutlinePlus,
  HiOutlineCollection,
  HiOutlineChartPie,
  HiOutlineUsers,
  HiOutlineArrowRight,
} from "react-icons/hi";

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER: Chào hỏi & Action nhanh */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Khu vực <span className="text-indigo-600">Giáo viên</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 italic">
              Chúc thầy/cô{" "}
              <span className="text-slate-800 font-bold">{user?.name}</span> một
              ngày làm việc hiệu quả!
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create-exam")}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <HiOutlinePlus size={24} />
            TẠO ĐỀ THI MỚI
          </motion.button>
        </motion.div>

        {/* STATS AREA: Các con số thống kê nhanh (Giả lập) */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {[
            {
              label: "Đề thi đã tạo",
              value: "12",
              icon: <HiOutlineCollection />,
              color: "bg-blue-500",
            },
            {
              label: "Lượt làm bài",
              value: "248",
              icon: <HiOutlineChartPie />,
              color: "bg-purple-500",
            },
            {
              label: "Tổng học sinh",
              value: "85",
              icon: <HiOutlineUsers />,
              color: "bg-emerald-500",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 flex items-center gap-5"
            >
              <div
                className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* MAIN ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/manage-exams")}
          className="group cursor-pointer bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 p-6">
            <div className="w-full md:w-48 h-48 bg-slate-100 rounded-4xl flex items-center justify-center text-7xl group-hover:bg-indigo-50 group-hover:scale-105 transition-all duration-500">
              🗂️
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
                  Quản lý & Chấm điểm
                </h2>
                <HiOutlineArrowRight
                  className="text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all"
                  size={28}
                />
              </div>
              <p className="text-slate-500 font-medium text-lg max-w-2xl">
                Trung tâm điều khiển chính. Tại đây thầy/cô có thể xem lại toàn
                bộ kho lưu trữ đề thi, chỉnh sửa nội dung, hoặc thực hiện chấm
                điểm tự luận cho các bài thi mới nhất.
              </p>

              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold italic">
                  #QuảnLýKhoĐề
                </span>
                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold italic">
                  #ChấmTựLuận
                </span>
                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold italic">
                  #ThốngKêĐiểm
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
