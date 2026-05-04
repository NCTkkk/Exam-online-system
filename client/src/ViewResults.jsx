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
  HiOutlineSearch, // Thêm icon kính lúp
  HiOutlineFilter,
} from "react-icons/hi";
import { usePagination } from "./usePagination";
import Pagination from "./Pagination";

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State để lưu từ khóa tìm kiếm
  const [subjectSearch, setSubjectSearch] = useState("");
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

  // --- LOGIC LỌC & SẮP XẾP THEO VỊ TRÍ ---
  // const filteredResults = results
  //   .filter((res) =>
  //     (res.exam?.title || "Đề thi không tên")
  //       .toLowerCase()
  //       .includes(searchTerm.toLowerCase()),
  //   )
  //   .sort((a, b) => {
  //     const term = searchTerm.toLowerCase();
  //     const indexA = (a.exam?.title || "Đề thi không tên")
  //       .toLowerCase()
  //       .indexOf(term);
  //     const indexB = (b.exam?.title || "Đề thi không tên")
  //       .toLowerCase()
  //       .indexOf(term);

  //     if (indexA !== indexB) return indexA - indexB;
  //     return new Date(b.createdAt) - new Date(a.createdAt); // Sắp xếp thêm theo ngày nếu cùng vị trí
  //   });

  // --- LOGIC LỌC & SẮP XẾP ĐỒNG BỘ ---
  const filteredResults = useMemo(() => {
    let resData = [...results];

    // 1. Lọc theo Môn học (Ô nhập văn bản)
    if (subjectSearch.trim()) {
      const sSearch = subjectSearch.toLowerCase();
      resData = resData.filter((res) => {
        // Kiểm tra kỹ cả trong res.exam.subject hoặc res.subject tùy theo schema của bạn
        const subjectName = res.exam?.subject || res.subject || "";
        return subjectName.toLowerCase().includes(sSearch);
      });
    }

    // 2. Lọc theo Tên đề thi & Sắp xếp theo vị trí từ khóa (Logic xịn)
    if (!searchTerm.trim()) {
      // Nếu không search tên, chỉ sắp xếp theo thời gian mới nhất
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

        // Ưu tiên vị trí xuất hiện của từ khóa
        if (indexA !== indexB) return indexA - indexB;

        // Nếu cùng vị trí, ưu tiên ngày làm bài mới nhất
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [results, searchTerm, subjectSearch]);

  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    filteredResults, // Sử dụng mảng đã lọc
    3,
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
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

          {/* NHÓM TÌM KIẾM (ĐỒNG BỘ CSS KHO ĐỀ) */}
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            {/* Ô Lọc Môn Học */}
            <div className="relative w-full md:w-56 group">
              <HiOutlineFilter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Lọc môn học..."
                value={subjectSearch}
                onChange={(e) => {
                  setSubjectSearch(e.target.value);
                  jump(1);
                }}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all font-bold text-slate-600 placeholder:text-slate-300"
              />
            </div>

            {/* Ô Tìm kiếm Tên */}
            <div className="relative w-full md:w-72 group">
              <HiOutlineSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm tên đề thi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  jump(1);
                }}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all font-bold text-slate-600 placeholder:text-slate-300"
              />
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-4 mb-3 w-full">
                        {/* Tên đề thi - Thêm flex-grow để nó lấy hết chỗ trống bên trái */}
                        <h3 className="font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                          {res.exam?.title || "Đề thi không tên"}
                        </h3>

                        {/* HIỂN THỊ MÔN HỌC  */}
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

                    {/* Phần điểm & Trạng thái */}
                    <div className="flex flex-col items-center md:items-end w-full md:w-auto min-w-[140px] border-t md:border-none pt-4 md:pt-0">
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
                {searchTerm || subjectSearch
                  ? "Không tìm thấy kết quả"
                  : "Lịch sử trống"}
              </h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">
                {searchTerm || subjectSearch
                  ? "Hãy thử điều chỉnh từ khóa tìm kiếm hoặc môn học nhé!"
                  : "Bạn chưa thực hiện bài thi nào. Hãy bắt đầu ngay!"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
