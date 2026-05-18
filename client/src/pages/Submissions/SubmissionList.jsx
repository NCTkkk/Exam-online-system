import React, { useEffect, useState, useMemo } from "react";
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
  HiOutlineCalendar,
} from "react-icons/hi";

const SubmissionList = () => {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://exam-online-system-p6yp.onrender.com/api/submissions/exam/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSubmissions(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách bài nộp:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [examId]);

  // --- XỬ LÝ LỌC VÀ SẮP XẾP DANH SÁCH ---
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // 1. Lọc theo trạng thái trực tiếp từ DB (Đã đồng bộ hóa logic tự luận/trắc nghiệm từ Backend)
    if (filterStatus !== "all") {
      result = result.filter((sub) => {
        const isGraded = sub.status === "graded";
        return filterStatus === "graded" ? isGraded : !isGraded;
      });
    }

    // 2. Lọc theo từ khóa tìm kiếm (Tên hoặc Email)
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter((sub) => {
        const name = sub.student?.name?.toLowerCase() || "";
        const email = sub.student?.email?.toLowerCase() || "";
        return name.includes(s) || email.includes(s);
      });

      // 3. Sắp xếp ưu tiên kết quả khớp từ đầu chữ
      result.sort((a, b) => {
        const nameA = a.student?.name?.toLowerCase() || "";
        const nameB = b.student?.name?.toLowerCase() || "";
        const startsWithA = nameA.startsWith(s);
        const startsWithB = nameB.startsWith(s);

        if (startsWithA && !startsWithB) return -1;
        if (!startsWithA && startsWithB) return 1;
        return nameA.localeCompare(nameB);
      });
    }

    return result;
  }, [submissions, searchTerm, filterStatus]);

  // --- TÍNH TOÁN SỐ LIỆU THỐNG KÊ ---
  const stats = useMemo(() => {
    const gradedCount = submissions.filter((s) => s.status === "graded").length;
    return {
      total: submissions.length,
      graded: gradedCount,
      pending: submissions.length - gradedCount,
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
  }, [submissions]);

  const handleDelete = async (submissionId, studentName) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa bài nộp của "${studentName}"? Học sinh sẽ được hoàn lại 1 lượt làm bài và tính lại ELO.`,
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://exam-online-system-p6yp.onrender.com/api/submissions/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Cập nhật lại danh sách tại chỗ
        setSubmissions((prev) =>
          prev.filter((sub) => sub._id !== submissionId),
        );
        alert("Đã xóa và cập nhật lại bảng xếp hạng thành công!");
      } catch (err) {
        alert(
          "Lỗi: " + (err.response?.data?.message || "Không thể xóa bài nộp"),
        );
      }
    }
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

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <HiOutlineUserGroup size={20} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tên học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 placeholder:text-slate-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-6 text-slate-300 hover:text-slate-500 font-black text-xs uppercase tracking-widest"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-white shrink-0">
            {[
              { id: "all", label: "Tất cả" },
              { id: "graded", label: "Đã chấm" },
              { id: "pending", label: "Chưa chấm" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  filterStatus === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
            {filteredSubmissions.map((sub, index) => {
              const isItemGraded = sub.status === "graded";

              return (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
                >
                  <div className="flex items-center gap-5 flex-1 w-full">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xl border-2 border-white shadow-sm shrink-0">
                      {sub.student?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-black text-xl text-slate-800 leading-tight">
                          {sub.student?.name || "Học sinh ẩn danh"}
                        </h3>

                        <span
                          className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shrink-0 ${
                            isItemGraded
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {isItemGraded ? "✓ Đã chấm" : "● Đang chờ"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-1">
                          <HiOutlineMail className="shrink-0" />{" "}
                          {sub.student?.email}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-500 font-bold bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                          <HiOutlineCalendar size={13} />
                          <span>
                            {new Date(sub.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                          <span className="opacity-30">|</span>
                          <HiOutlineClock size={13} />
                          <span>
                            {new Date(sub.createdAt).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
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

                    <div className="flex items-center gap-3">
                      {/* Nút Chấm bài */}
                      <button
                        onClick={() => navigate(`/grade-submission/${sub._id}`)}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                          isItemGraded
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-100"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                        }`}
                      >
                        <HiOutlinePencilAlt size={20} />
                        {isItemGraded ? "SỬA ĐIỂM" : "CHẤM BÀI"}
                      </button>

                      {/* Nút Xóa */}
                      <button
                        onClick={() => handleDelete(sub._id, sub.student?.name)}
                        className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95 border border-red-100"
                        title="Xóa bài nộp"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;
