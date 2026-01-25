import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineClock,
  HiOutlineQuestionMarkCircle,
  HiOutlineSearch,
  HiOutlinePlay,
  HiOutlineUser,
} from "react-icons/hi";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/exams/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(res.data);
      } catch (err) {
        console.error("Lỗi lấy đề thi:", err);
      }
    };
    fetchExams();
  }, []);

  // Lọc đề thi theo tìm kiếm
  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Kho đề <span className="text-indigo-600">Trực tuyến</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Chọn một thử thách và bắt đầu chứng minh năng lực của bạn
            </p>
          </motion.div>

          {/* Thanh tìm kiếm xịn */}
          <div className="relative w-full md:w-96 group">
            <HiOutlineSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all font-bold text-slate-700"
            />
          </div>
        </div>

        {/* Grid danh sách đề thi */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 flex flex-col"
              >
                {/* Phần Top Thẻ (Màu sắc theo thời gian) */}
                <div
                  className={`h-3 w-full ${exam.duration > 45 ? "bg-orange-400" : "bg-indigo-500"}`}
                />

                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {exam.title}
                    </h3>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                      <div className="p-2 bg-slate-100 rounded-lg text-indigo-600">
                        <HiOutlineClock size={18} />
                      </div>
                      <span>Thời gian: {exam.duration} phút</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                      <div className="p-2 bg-slate-100 rounded-lg text-indigo-600">
                        <HiOutlineQuestionMarkCircle size={18} />
                      </div>
                      <span>Số câu hỏi: {exam.questions?.length || 0} câu</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest pt-2">
                      <HiOutlineUser size={16} />
                      <span>Thầy/Cô: {exam.author?.name || "Hệ thống"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/take-exam/${exam._id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                  >
                    <HiOutlinePlay size={20} />
                    BẮT ĐẦU THI
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-slate-800">
              Không tìm thấy đề thi nào
            </h3>
            <p className="text-slate-400 font-medium">
              Thử tìm kiếm với từ khóa khác nhé!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
