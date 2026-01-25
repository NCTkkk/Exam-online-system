import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineBadgeCheck,
  HiOutlineSearchCircle,
  HiOutlineClock,
} from "react-icons/hi";

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/submissions/my-results",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setResults(res.data);
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Lịch sử <span className="text-indigo-600">Làm bài</span>
            <HiOutlineClipboardList className="text-indigo-600" />
          </h2>
          <p className="text-slate-500 font-medium mt-2 italic">
            Xem lại quá trình nỗ lực và kết quả các kỳ thi bạn đã tham gia
          </p>
        </div>

        {/* LIST AREA */}
        <div className="space-y-6">
          {results.length > 0 ? (
            results.map((res, index) => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
              >
                {/* Thông tin bên trái */}
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 className="font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {res.exam?.title || "Đề thi không tên"}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl">
                      <HiOutlineCalendar size={16} />
                      {new Date(res.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl">
                      <HiOutlineClock size={16} />
                      {new Date(res.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/review-result/${res._id}`)}
                    className="mt-6 flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:text-white transition-all w-fit"
                  >
                    <HiOutlineSearchCircle size={22} />
                    XEM CHI TIẾT & ĐÁP ÁN
                  </motion.button>
                </div>

                {/* Phần điểm & Trạng thái bên phải */}
                <div className="flex flex-col items-center md:items-end w-full md:w-auto min-w-35 border-t md:border-none pt-4 md:pt-0">
                  <div className="text-center md:text-right mb-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                      Điểm trắc nghiệm
                    </p>
                    <div className="flex items-baseline justify-center md:justify-end gap-1">
                      <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                        {res.scoreAuto}
                      </span>
                      <span className="text-slate-300 font-bold">/10</span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm ${
                      res.status === "pending"
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}
                  >
                    {res.status === "pending" ? (
                      <>
                        <HiOutlineClock size={14} /> Đang chờ chấm tự luận
                      </>
                    ) : (
                      <>
                        <HiOutlineBadgeCheck size={14} /> Hoàn thành kết quả
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200"
            >
              <div className="text-7xl mb-6">🏜️</div>
              <h3 className="text-2xl font-black text-slate-800">
                Kho dữ liệu trống
              </h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">
                Bạn chưa thực hiện bài thi nào. Hãy bắt đầu chinh phục đề thi
                ngay hôm nay!
              </p>
              <button
                onClick={() => navigate("/exam-list")}
                className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-600 transition-all"
              >
                KHÁM PHÁ ĐỀ THI
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
