import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineClock,
  HiOutlineQuestionMarkCircle,
  HiOutlineSearch,
  HiOutlinePlay,
  HiOutlineUser,
  HiOutlineFilter,
} from "react-icons/hi";
import { usePagination } from "./usePagination";
import Pagination from "./Pagination";

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://exam-online-system-p6yp.onrender.com/api/exams/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setExams(res.data);
      } catch (err) {
        console.error("Lỗi lấy đề thi:", err);
      }
    };
    fetchExams();
  }, []);

  const subjects = useMemo(() => {
    const allSubjects = exams
      .map((exam) => exam.subject)
      .filter((s) => s && s.trim() !== "");
    return [...new Set(allSubjects)];
  }, [exams]);

  const filteredExams = React.useMemo(() => {
    let result = [...exams];

    // 1. Lọc theo Môn học
    if (subjectSearch.trim()) {
      result = result.filter((exam) =>
        exam.subject?.toLowerCase().includes(subjectSearch.toLowerCase()),
      );
    }

    // 2. Lọc theo Tên người ra đề (Author)
    if (authorSearch.trim()) {
      result = result.filter((exam) =>
        exam.author?.name?.toLowerCase().includes(authorSearch.toLowerCase()),
      );
    }

    // 3. Lọc theo Thời gian tối đa (Dưới hoặc bằng X phút)
    if (maxDuration) {
      result = result.filter((exam) => exam.duration <= parseInt(maxDuration));
    }

    // 4. Lọc và Sắp xếp theo Tên đề thi (Logic cũ của bạn)
    if (!searchTerm.trim()) return result;

    const search = searchTerm.toLowerCase();
    return result
      .filter((exam) => exam.title.toLowerCase().includes(search))
      .sort((a, b) => {
        const indexA = a.title.toLowerCase().indexOf(search);
        const indexB = b.title.toLowerCase().indexOf(search);
        if (indexA !== indexB) return indexA - indexB;
        return a.title.length - b.title.length;
      });
  }, [exams, searchTerm, subjectSearch, authorSearch, maxDuration]);

  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    filteredExams,
    6,
  );

  useEffect(() => {
    jump(1);
  }, [searchTerm]);

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search Group */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
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

          {/* Nhóm tìm kiếm và lọc nâng cao */}
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-sm mb-8 border border-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Lọc Môn Học */}
              <div className="relative group">
                <HiOutlineFilter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Môn học..."
                  value={subjectSearch}
                  onChange={(e) => {
                    setSubjectSearch(e.target.value);
                    jump(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-600 placeholder:text-slate-300 text-xs"
                />
              </div>

              {/* 2. Lọc Tên Giáo Viên - ĐÃ FIX LỖI NHẬP LIỆU */}
              <div className="relative group">
                <HiOutlineUser
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Giáo viên..."
                  value={authorSearch}
                  onChange={(e) => {
                    setAuthorSearch(e.target.value);
                    jump(1);
                  }} // Sửa lỗi ở đây
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-600 placeholder:text-slate-300 text-xs"
                />
              </div>

              {/* 3. Tìm Tên Đề Thi */}
              <div className="relative group">
                <HiOutlineSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Tên đề thi..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    jump(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-600 placeholder:text-slate-300 text-xs"
                />
              </div>

              {/* 4. Lọc Thời Gian */}
              <div className="relative group">
                <HiOutlineClock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <select
                  value={maxDuration}
                  onChange={(e) => {
                    setMaxDuration(e.target.value);
                    jump(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-600 text-xs appearance-none cursor-pointer"
                >
                  <option value="">Thời gian</option>
                  <option value="5">≤ 5 phút</option>
                  <option value="15">≤ 15 phút</option>
                  <option value="45">≤ 45 phút</option>
                  <option value="60">≤ 60 phút</option>
                  <option value="90">≤ 90 phút</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Nút xóa nhanh */}
            {(searchTerm || subjectSearch || authorSearch || maxDuration) && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSubjectSearch("");
                    setAuthorSearch("");
                    setMaxDuration("");
                    jump(1);
                  }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors duration-300"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Reset bộ lọc
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid danh sách đề thi */}
        {currentData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              <AnimatePresence mode="popLayout">
                {currentData.map((exam) => (
                  <motion.div
                    key={exam._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 flex flex-col group"
                  >
                    {/* Thanh màu trang trí */}
                    <div
                      className={`h-3 w-full transition-colors duration-300 ${
                        exam.duration > 45 ? "bg-orange-400" : "bg-indigo-500"
                      }`}
                    />

                    <div className="p-8 flex-1">
                      <div className="mb-4">
                        <h3
                          className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors truncate w-full"
                          title={exam.title}
                        >
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
                          <span>
                            Số câu hỏi: {exam.questions?.length || 0} câu
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest pt-2">
                          <HiOutlineUser size={16} />
                          <span>
                            Thầy/Cô: {exam.author?.name || "Hệ thống"}
                          </span>
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
              </AnimatePresence>
            </div>

            {/* PHÂN TRANG */}
            <Pagination
              currentPage={currentPage}
              maxPage={maxPage}
              next={next}
              prev={prev}
              jump={jump}
            />
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-slate-800">
              Không tìm thấy đề thi nào
            </h3>
            <p className="text-slate-400 font-medium mt-2">
              {searchTerm || subjectSearch
                ? "Thử thay đổi từ khóa hoặc môn học đang tìm kiếm nhé!"
                : "Hiện tại chưa có đề thi nào trong hệ thống."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
