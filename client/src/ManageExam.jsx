import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiPlus,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckBadge,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { usePagination } from "./usePagination";
import Pagination from "./Pagination";

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyExams = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://exam-online-system-p6yp.onrender.com/api/exams/my-exams",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setExams(res.data);
    };
    fetchMyExams();
  }, []);

  // const filteredExams = exams.filter((exam) =>
  //   exam.title.toLowerCase().includes(searchTerm.toLocaleLowerCase()),
  // );

  const [subjectFilter, setSubjectFilter] = useState(""); // Đừng quên thêm state này ở trên

  const filteredExams = React.useMemo(() => {
    // Bước 1: Lấy danh sách gốc
    let result = [...exams];

    // Bước 2: Lọc theo Môn học (Subject) trước - Lọc tuyệt đối/tương đối đơn giản
    if (subjectFilter.trim()) {
      const subSearch = subjectFilter.toLowerCase();
      result = result.filter((exam) => {
        const examSubject = exam.subject
          ? String(exam.subject).toLowerCase()
          : "";
        return examSubject.includes(subSearch);
      });
    }

    // Bước 3: Lọc theo Tên đề (Search Term) và giữ nguyên logic Sort ưu tiên của bạn
    if (!searchTerm.trim()) return result;

    const search = searchTerm.toLowerCase();

    return result
      .filter((exam) => exam.title.toLowerCase().includes(search))
      .sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        const indexA = titleA.indexOf(search);
        const indexB = titleB.indexOf(search);

        // Giữ nguyên logic cũ của bạn:
        // 1. Ưu tiên vị trí xuất hiện của từ khóa
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        // 2. Ưu tiên tiêu đề ngắn hơn
        return titleA.length - titleB.length;
      });
  }, [exams, searchTerm, subjectFilter]); // Thêm subjectFilter vào dependency array

  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    filteredExams,
    5, // Số lượng đề mỗi trang
  );

  useEffect(() => {
    jump(1);
  }, [searchTerm, subjectFilter]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa đề thi này? Hành động này không thể hoàn tác!",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://exam-online-system-p6yp.onrender.com/api/exams/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setExams(exams.filter((e) => e._id !== id));
      } catch (err) {
        alert("Lỗi: " + (err.response?.data || "Không thể xóa"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Kho <span className="text-indigo-600">Đề thi</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Quản lý, chỉnh sửa và theo dõi kết quả bài thi của bạn
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create-exam")}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <HiPlus size={20} strokeWidth={3} />
            TẠO ĐỀ MỚI
          </motion.button>
        </div>

        {/* 3. SEARCH BAR SECTION - Cập nhật 2 ô lọc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Lọc theo Tên đề */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <HiOutlineMagnifyingGlass size={22} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tên đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 py-4 pl-12 pr-12 rounded-2xl shadow-sm font-medium text-slate-700 transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-4 text-[10px] font-black text-slate-300 hover:text-indigo-600 uppercase transition-colors"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Lọc theo Tên môn học */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500">
              <HiOutlineDocumentText size={22} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Lọc theo tên môn (Toán, Anh...)"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full bg-white border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 py-4 pl-12 pr-12 rounded-2xl shadow-sm font-medium text-slate-700 transition-all outline-none"
            />
            {subjectFilter && (
              <button
                onClick={() => setSubjectFilter("")}
                className="absolute inset-y-0 right-4 text-[10px] font-black text-slate-300 hover:text-emerald-600 uppercase transition-colors"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/*  */}
        {/* GRID LIST */}
        <div className="grid grid-cols-1 gap-6">
          {currentData.length > 0 ? (
            <>
              <AnimatePresence mode="popLayout">
                {currentData.map((examItem, index) => (
                  <motion.div
                    key={examItem._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <HiOutlineDocumentText size={24} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                            {examItem.title}
                          </h3>
                          {/* Hiển thị môn học nếu có */}
                          {examItem.subject && (
                            <span className="inline-block mt-1 px-3 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                              Môn: {examItem.subject}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Thông tin Thời gian và Ngày tạo (Đã khôi phục) */}
                      <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest ml-1">
                        <div className="flex items-center gap-1.5">
                          <HiOutlineClock size={16} />
                          {examItem.duration} PHÚT
                        </div>
                        <div className="flex items-center gap-1.5 border-l pl-4">
                          <HiOutlineCalendar size={16} />
                          {new Date(examItem.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </div>

                      {/* Nút danh sách nộp bài & Excel (Đã khôi phục) */}
                      <button
                        onClick={() =>
                          navigate(`/exam-submissions/${examItem._id}`)
                        }
                        className="mt-5 flex items-center gap-2 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-black transition-all"
                      >
                        <HiOutlineChartBar size={18} />
                        DANH SÁCH NỘP BÀI & XUẤT EXCEL
                      </button>
                    </div>

                    {/* ACTION BUTTONS (Giữ nguyên các nút Chấm bài, Sửa, Xóa) */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-none">
                      <button
                        onClick={() => navigate(`/submissions/${examItem._id}`)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                      >
                        <HiOutlineCheckBadge size={20} />
                        CHẤM BÀI
                      </button>

                      <button
                        onClick={() => navigate(`/edit-exam/${examItem._id}`)}
                        className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                      >
                        <HiOutlinePencilSquare size={20} />
                        SỬA
                      </button>

                      <button
                        onClick={() => handleDelete(examItem._id)}
                        className="flex items-center justify-center gap-2 bg-red-50 text-red-500 px-5 py-3 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all"
                      >
                        <HiOutlineTrash size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* --- COMPONENT PHÂN TRANG (Giống ExamList) --- */}
                <div className="mt-10">
                  <Pagination
                    currentPage={currentPage}
                    maxPage={maxPage}
                    next={next}
                    prev={prev}
                    jump={jump}
                  />
                </div>
              </AnimatePresence>
            </>
          ) : (
            /* UI khi không tìm thấy kết quả */
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black text-xl">
                {searchTerm || subjectFilter
                  ? `Không tìm thấy đề thi nào khớp với yêu cầu lọc`
                  : "Bạn chưa có đề thi nào."}
              </p>
              {!searchTerm && !subjectFilter && (
                <button
                  onClick={() => navigate("/create-exam")}
                  className="mt-4 text-indigo-600 font-bold hover:underline"
                >
                  Tạo đề đầu tiên ngay!
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageExams;
