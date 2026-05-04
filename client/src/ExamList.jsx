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

  const subjects = useMemo(() => {
    const allSubjects = exams
      .map((exam) => exam.subject)
      .filter((s) => s && s.trim() !== "");
    return [...new Set(allSubjects)];
  }, [exams]);

  // Lọc đề thi theo tìm kiếm
  // const filteredExams = exams.filter((exam) =>
  //   exam.title.toLowerCase().includes(searchTerm.toLowerCase()),
  // );
  const filteredExams = React.useMemo(() => {
    // 1. Tạo bản sao mảng gốc
    let result = [...exams];

    // 2. Lọc theo Môn học (Dạng nhập văn bản - Partial match)
    if (subjectSearch.trim()) {
      const sSearch = subjectSearch.toLowerCase();
      result = result.filter((exam) =>
        exam.subject?.toLowerCase().includes(sSearch),
      );
    }

    // 3. Nếu không có từ khóa tìm kiếm tên, trả về kết quả đã lọc theo môn
    if (!searchTerm.trim()) return result;

    // 4. Logic tìm kiếm và sắp xếp tên đề thi "xịn" (Giữ nguyên 100%)
    const search = searchTerm.toLowerCase();

    return result
      .filter((exam) => exam.title.toLowerCase().includes(search))
      .sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        const indexA = titleA.indexOf(search);
        const indexB = titleB.indexOf(search);

        // Ưu tiên tiêu đề có từ khóa nằm ở vị trí đầu tiên hơn
        if (indexA !== indexB) {
          return indexA - indexB;
        }

        // Nếu cùng vị trí, ưu tiên tiêu đề ngắn hơn
        return titleA.length - titleB.length;
      });
  }, [exams, searchTerm, subjectSearch]); // Dependency dùng subjectSearch

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

          {/* Nhóm tìm kiếm và lọc: Đồng bộ CSS với trang Quản lý */}
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            {/* Ô Lọc Môn Học (Dạng Input nhập văn bản) */}
            <div className="relative w-full md:w-64 group">
              <HiOutlineFilter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Lọc môn học..."
                value={subjectSearch} // Chú ý: Đổi tên state thành subjectSearch cho đúng bản chất
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all font-bold text-slate-700"
              />
            </div>

            {/* Ô Tìm kiếm Tên Đề Thi */}
            <div className="relative w-full md:w-80 group">
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
