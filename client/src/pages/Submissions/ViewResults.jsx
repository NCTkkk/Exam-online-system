import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineBadgeCheck,
  HiOutlineSearchCircle,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
} from "react-icons/hi";
import { usePagination } from "../../components/common/usePagination";
import Pagination from "../../components/common/Pagination";

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State để lưu từ khóa tìm kiếm
  const [subjectSearch, setSubjectSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all"); // all, graded, pending
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const filteredResults = useMemo(() => {
    let resData = [...results];

    // 1. Lọc theo Môn học
    if (subjectSearch.trim()) {
      const sSearch = subjectSearch.toLowerCase();
      resData = resData.filter((res) => {
        const subjectName = res.exam?.subject || res.subject || "";
        return subjectName.toLowerCase().includes(sSearch);
      });
    }

    // 2. MỚI: Lọc theo Trạng thái (Đã chấm / Chưa chấm)
    if (statusFilter !== "all") {
      resData = resData.filter((res) => res.status === statusFilter);
    }

    // 3. MỚI: Lọc theo Khoảng thời gian
    if (startDate || endDate) {
      resData = resData.filter((res) => {
        const resDate = new Date(res.createdAt);
        resDate.setHours(0, 0, 0, 0); // Đưa về 0h để so sánh chính xác theo ngày

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(0, 0, 0, 0);

        if (start && end) return resDate >= start && resDate <= end;
        if (start) return resDate >= start;
        if (end) return resDate <= end;
        return true;
      });
    }

    // 4. Lọc theo Tên đề thi & Sắp xếp (Logic cũ của bạn)
    if (!searchTerm.trim()) {
      return resData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }

    const term = searchTerm.toLowerCase();
    return resData
      .filter((res) =>
        (res.exam?.title || "Đề thi không tên").toLowerCase().includes(term),
      )
      .sort((a, b) => {
        const titleA = (a.exam?.title || "Đề thi không tên").toLowerCase();
        const titleB = (b.exam?.title || "Đề thi không tên").toLowerCase();
        const indexA = titleA.indexOf(term);
        const indexB = titleB.indexOf(term);
        if (indexA !== indexB) return indexA - indexB;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [results, searchTerm, subjectSearch, statusFilter, startDate, endDate]); // Đừng quên thêm dependency

  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    filteredResults, // Sử dụng mảng đã lọc
    3,
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Lịch sử <span className="text-indigo-600">Làm bài</span>
              <HiOutlineClipboardList className="text-indigo-600" />
            </h2>
            <p className="text-slate-500 font-medium mt-2 italic">
              Xem lại quá trình nỗ lực và kết quả các kỳ thi bạn đã tham gia
            </p>
          </motion.div>
        </div>

        {/* BỘ LỌC TỔNG HỢP CAO CẤP */}
        <div className="relative mb-12">
          {/* Glassmorphism Background Decor */}
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[3rem] blur-2xl opacity-50" />

          <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.05)] border border-white space-y-8">
            {/* HÀNG 1: TÌM KIẾM CHÍNH */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Search Đề thi */}
              <div className="lg:col-span-7 relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <HiOutlineSearch
                    className="text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300"
                    size={22}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Tìm tên đề thi bạn đã thực hiện..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    jump(1);
                  }}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-200 transition-all duration-300 font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm"
                />
              </div>

              {/* Lọc Môn học */}
              <div className="lg:col-span-5 relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <HiOutlineFilter
                    className="text-slate-400 group-focus-within:text-purple-600 transition-colors duration-300"
                    size={20}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Lọc theo môn học..."
                  value={subjectSearch}
                  onChange={(e) => {
                    setSubjectSearch(e.target.value);
                    jump(1);
                  }}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:bg-white focus:border-purple-200 transition-all duration-300 font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* HÀNG 2: LỌC NÂNG CAO */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 pt-6 border-t border-slate-100/80">
              {/* Bộ Chọn Trạng Thái (Tab Style) */}
              <div className="flex flex-col gap-3 w-full xl:w-auto">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Trạng thái chấm điểm
                </span>
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-fit">
                  {[
                    { id: "all", label: "Tất cả", color: "indigo" },
                    { id: "graded", label: "Đã chấm xong", color: "emerald" },
                    { id: "pending", label: "Đang chờ", color: "amber" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setStatusFilter(tab.id);
                        jump(1);
                      }}
                      className={`relative px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                        statusFilter === tab.id
                          ? "bg-white text-indigo-600 shadow-md scale-105"
                          : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                      }`}
                    >
                      {tab.label}
                      {statusFilter === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bộ Lọc Thời Gian (Elegant inputs) */}
              <div className="flex flex-col gap-3 w-full xl:w-auto">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Khoảng thời gian nộp bài
                </span>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        jump(1);
                      }}
                      className="bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all cursor-pointer"
                    />
                  </div>
                  <div className="h-px w-4 bg-slate-200" />
                  <div className="relative group">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        jump(1);
                      }}
                      className="bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all cursor-pointer"
                    />
                  </div>

                  {/* Nút Reset Thông Minh */}
                  {(searchTerm ||
                    subjectSearch ||
                    statusFilter !== "all" ||
                    startDate ||
                    endDate) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSearchTerm("");
                        setSubjectSearch("");
                        setStatusFilter("all");
                        setStartDate("");
                        setEndDate("");
                        jump(1);
                      }}
                      className="ml-2 p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300"
                      title="Đặt lại bộ lọc"
                    >
                      <HiOutlineRefresh
                        size={18}
                        className={
                          searchTerm || subjectSearch ? "animate-spin-slow" : ""
                        }
                      />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LIST AREA */}
        <div className="space-y-6">
          {currentData.length > 0 ? (
            <>
              <AnimatePresence mode="popLayout">
                {currentData.map((res) => (
                  <motion.div
                    key={res._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-4 mb-3 w-full">
                        <h3 className="font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                          {res.exam?.title || "Đề thi không tên"}
                        </h3>
                        {res.exam?.subject && (
                          <span className="shrink-0 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                            {res.exam.subject}
                          </span>
                        )}
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
                        <span
                          className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                            res.status === "graded"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {res.status === "graded" ? "✓ Đã chấm" : "● Đang chờ"}
                        </span>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3 w-full">
                        {/* Nút xem chi tiết đáp án */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/review-result/${res._id}`)}
                          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:text-white transition-all w-fit"
                        >
                          <HiOutlineSearchCircle size={22} />
                          XEM CHI TIẾT & ĐÁP ÁN
                        </motion.button>

                        {/* Nút thi lại */}
                        {(res.exam?.maxAttempts === 0 ||
                          res.exam?.currentAttempts <
                            res.exam?.maxAttempts) && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              navigate(`/take-exam/${res.exam._id}`)
                            }
                            className="flex items-center gap-2 bg-rose-50 text-rose-500 px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white transition-all w-fit border border-rose-100"
                          >
                            <HiOutlineRefresh size={20} />
                            LÀM LẠI
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Phần điểm & Trạng thái */}
                    <div className="flex flex-col items-center md:items-end w-full md:w-auto min-w-[140px] border-t md:border-none pt-4 md:pt-0">
                      <div className="text-center md:text-right mb-3">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                          Tổng điểm
                        </p>
                        <div className="flex items-baseline justify-center md:justify-end gap-1">
                          <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                            {parseFloat(
                              (
                                Number(res.scoreAuto || 0) +
                                Number(res.scoreManual || 0)
                              ).toFixed(2),
                            )}
                          </span>

                          {/* hehe nè */}
                          <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                            /{res.exam.totalPoints || 0}đ
                          </span>
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
                            {" "}
                            <HiOutlineClock size={14} /> Đang chờ chấm tự
                            luận{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            <HiOutlineBadgeCheck size={14} /> Hoàn thành kết
                            quả{" "}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  maxPage={maxPage}
                  next={next}
                  prev={prev}
                  jump={jump}
                />
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200"
            >
              <div className="text-7xl mb-6">🔍</div>
              <h3 className="text-2xl font-black text-slate-800">
                Không tìm thấy kết quả
              </h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">
                Hãy thử điều chỉnh từ khóa tìm kiếm, trạng thái hoặc khoảng thời
                gian nhé!
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSubjectSearch("");
                  setStatusFilter("all");
                  setStartDate("");
                  setEndDate("");
                  jump(1);
                }}
                className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
              >
                Xóa tất cả bộ lọc
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
