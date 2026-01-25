import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  HiOutlineChevronLeft,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlinePencilAlt,
  HiOutlineMail,
} from "react-icons/hi";

const SubmissionList = () => {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/submissions/exam/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSubmissions(res.data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [examId]);

  const stats = {
    total: submissions.length,
    graded: submissions.filter((s) => s.status === "graded").length,
    pending: submissions.filter((s) => s.status === "pending").length,
    avgScore:
      submissions.length > 0
        ? (
            submissions.reduce(
              (acc, s) => acc + (s.scoreAuto + (s.scoreManual || 0)),
              0,
            ) / submissions.length
          ).toFixed(1)
        : 0,
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen font-black text-indigo-600 animate-pulse">
        ĐANG TẢI DỮ LIỆU...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-2 transition-colors uppercase tracking-widest"
            >
              <HiOutlineChevronLeft size={20} /> Quay lại quản lý đề
            </button>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Danh sách <span className="text-indigo-600">Bài nộp</span>
            </h2>
          </motion.div>

          {/* TOTAL AVG SCORE BADGE */}
          <div className="bg-indigo-600 p-4 px-8 rounded-3xl shadow-xl shadow-indigo-100 text-white flex items-center gap-4">
            <HiOutlineChartBar size={30} />
            <div>
              <p className="text-[10px] font-black uppercase opacity-70 leading-none mb-1">
                Điểm TB cả lớp
              </p>
              <p className="text-2xl font-black leading-none">
                {stats.avgScore}
                <span className="text-sm">/10</span>
              </p>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: "Tổng số bài",
              value: stats.total,
              color: "text-blue-600",
              bg: "bg-blue-50",
              icon: <HiOutlineUserGroup size={24} />,
            },
            {
              label: "Đã chấm điểm",
              value: stats.graded,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              icon: <HiOutlineCheckCircle size={24} />,
            },
            {
              label: "Đang chờ chấm",
              value: stats.pending,
              color: "text-orange-600",
              bg: "bg-orange-50",
              icon: <HiOutlineClock size={24} />,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-4xl border border-white shadow-sm flex items-center gap-5"
            >
              <div className={`${item.bg} ${item.color} p-4 rounded-2xl`}>
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {item.label}
                </p>
                <p className={`text-3xl font-black ${item.color}`}>
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SUBMISSIONS LIST */}
        {submissions.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xl italic">
              Chưa có học sinh nào nộp bài...
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((sub, index) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex items-center gap-5 flex-1 w-full">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xl border-2 border-white shadow-sm">
                    {sub.student?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 leading-tight">
                      {sub.student?.name || "Học sinh ẩn danh"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-400 font-medium flex items-center gap-1">
                        <HiOutlineMail /> {sub.student?.email}
                      </p>
                      <span
                        className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                          sub.status === "graded"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {sub.status === "graded" ? "✓ Đã chấm" : "● Đang chờ"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
                  <div className="text-center md:text-right">
                    <p className="text-3xl font-black text-indigo-600 leading-none">
                      {(sub.scoreAuto + (sub.scoreManual || 0)).toFixed(1)}
                      <span className="text-xs text-slate-300 ml-1 italic font-normal">
                        điểm
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/grade/${sub._id}`)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                      sub.status === "graded"
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-100"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                    }`}
                  >
                    <HiOutlinePencilAlt size={20} />
                    {sub.status === "graded" ? "SỬA ĐIỂM" : "CHẤM BÀI"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;
