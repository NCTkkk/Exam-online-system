import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlineFilter,
  HiOutlineDownload,
  HiRefresh,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineSearch,
  HiOutlineChartBar,
  HiSave,
} from "react-icons/hi";
import { exportSubmissionsToExcel } from "../../utils/excelUtils";

import Pagination from "../../components/common/Pagination";
import { usePagination } from "../../components/common/usePagination";

const ExamSubmissions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [examTitle, setExamTitle] = useState("");

  // --- STATES BỘ LỌC ---
  const [exactValue, setExactValue] = useState("");
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");

  const [statusFilter, setStatusFilter] = useState("all"); // all, graded, pending
  const [studentSearch, setStudentSearch] = useState("");
  const [extremeFilter, setExtremeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOrder, setSortOrder] = useState("none"); // none, asc (tăng), desc (giảm)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const token = localStorage.getItem("token");
  //     try {
  //       // 1. Gọi API lấy danh sách bài nộp
  //       const resSubmissions = await axios.get(
  //         `http://localhost:5000/api/submissions/exam/${examId}`,
  //         { headers: { Authorization: `Bearer ${token}` } },
  //       );
  //       setSubmissions(resSubmissions.data);

  //       // 2. Gọi thêm API lấy thông tin Exam để lấy tiêu đề chuẩn
  //       const resExam = await axios.get(
  //         `http://localhost:5000/api/exams/${examId}`,
  //         { headers: { Authorization: `Bearer ${token}` } },
  //       );
  //       setLoading(false);
  //       setError("");
  //       setExamTitle(resExam.data.title);
  //     } catch (err) {
  //       console.error("Lỗi lấy dữ liệu:", err);
  //       if (submissions.length > 0) {
  //         setExamTitle(submissions[0].exam?.title || "Đề thi đã bị xóa");
  //       } else {
  //         setExamTitle("Không tìm thấy thông tin đề thi");
  //       }
  //     }
  //   };
  //   fetchData();
  // }, [examId]);

  // --- LOGIC LỌC DỮ LIỆU TỔNG HỢP ---

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      let submissionsData = [];

      try {
        setLoading(true);
        setError("");

        const resSubmissions = await axios.get(
          `http://localhost:5000/api/submissions/exam/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        submissionsData = resSubmissions.data;
        setSubmissions(submissionsData);

        const resExam = await axios.get(
          `http://localhost:5000/api/exams/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setExamTitle(resExam.data.title);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);

        if (submissionsData.length > 0) {
          setExamTitle(submissionsData[0].exam?.title || "Đề thi đã bị xóa");
        } else {
          setExamTitle("Không tìm thấy thông tin đề thi");
        }

        setError("Không thể tải đầy đủ dữ liệu bài nộp.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  const filteredSubmissions = useMemo(() => {
    let result = submissions.filter((s) => {
      // 1. Lọc theo tên học sinh
      const nameMatch = s.student?.name
        ?.toLowerCase()
        .includes(studentSearch.toLowerCase());

      // 2. Lọc theo trạng thái chấm điểm (Đã đồng bộ với Backend)
      const isGraded = s.status === "graded";
      const statusMatch =
        statusFilter === "all"
          ? true
          : statusFilter === "graded"
            ? isGraded
            : !isGraded;

      return nameMatch && statusMatch;
    });

    // 3. Lọc lấy bài Cao nhất / Thấp nhất (Nếu chọn)
    if (extremeFilter !== "all") {
      const studentGroups = {};
      result.forEach((s) => {
        const sid = s.student?._id || s.student?.email;
        if (!studentGroups[sid]) studentGroups[sid] = [];
        studentGroups[sid].push(s);
      });

      result = Object.values(studentGroups).map((group) => {
        return group.reduce((prev, current) => {
          const scorePrev =
            (Number(prev.scoreAuto) || 0) + (Number(prev.scoreManual) || 0);
          const scoreCurr =
            (Number(current.scoreAuto) || 0) +
            (Number(current.scoreManual) || 0);
          return extremeFilter === "highest"
            ? scoreCurr > scorePrev
              ? current
              : prev
            : scoreCurr < scorePrev
              ? current
              : prev;
        });
      });
    }

    // 4. Lọc theo Khoảng điểm
    result = result.filter((s) => {
      const totalScore =
        (Number(s.scoreAuto) || 0) + (Number(s.scoreManual) || 0);
      const min = rangeMin === "" ? -Infinity : Number(rangeMin);
      const max = rangeMax === "" ? Infinity : Number(rangeMax);
      if (isNaN(min) || isNaN(max)) return true; // Nếu nhập không phải số, bỏ qua lọc khoảng
      if (min > max) return true; // Nếu khoảng không hợp lệ, bỏ qua lọc khoảng
      return totalScore >= min && totalScore <= max;
    });

    // THÊM LOGIC SẮP XẾP VÀO ĐÂY (TRƯỚC KHI RETURN):
    if (sortOrder !== "none") {
      result.sort((a, b) => {
        const scoreA =
          (Number(a.scoreAuto) || 0) + (Number(a.scoreManual) || 0);
        const scoreB =
          (Number(b.scoreAuto) || 0) + (Number(b.scoreManual) || 0);

        return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
      });
    }

    return result;
  }, [
    submissions,
    studentSearch,
    statusFilter,
    extremeFilter,
    rangeMin,
    rangeMax,
    sortOrder,
  ]);

  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    filteredSubmissions,
    5,
  );

  // 🌟 Cập nhật hàm này để truyền thêm object chứa các state lọc hiện tại
  const handleExportExcel = () => {
    exportSubmissionsToExcel(filteredSubmissions, examTitle, {
      studentSearch,
      statusFilter,
      extremeFilter,
      rangeMin,
      rangeMax,
    });
  };

  const resetFilters = () => {
    setStudentSearch("");
    setStatusFilter("all");
    setExtremeFilter("all");
    setExactValue("");
    setRangeMin("");
    setRangeMax("");
  };

  const handleDelete = async (submissionId, studentName) => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa bài nộp của "${studentName}"?\n\n- Học sinh sẽ được cộng lại 1 lượt làm bài.\n- Hệ thống sẽ tính toán lại ELO & Hạng ngay lập tức.`;

    if (window.confirm(confirmMessage)) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/submissions/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Cập nhật state gốc để filteredSubmissions tự động chạy lại
        setSubmissions((prev) => prev.filter((s) => s._id !== submissionId));

        // Thông báo nhẹ nhàng (tùy chọn)
        console.log("Đã xóa bài nộp và cập nhật ELO");
      } catch (err) {
        alert(
          "Lỗi khi xóa: " +
            (err.response?.data?.message || "Không thể thực hiện"),
        );
      }
    }
  };

  useEffect(() => {
    jump(1);
  }, [
    studentSearch,
    statusFilter,
    extremeFilter,
    rangeMin,
    rangeMax,
    sortOrder,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4 mx-auto"></div>
          <h2 className="text-xl font-bold text-gray-700">
            Đang tải dữ liệu...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-12 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            Danh sách bài nộp
          </h2>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Đề thi: {examTitle}
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={filteredSubmissions.length === 0}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95"
        >
          <HiOutlineDownload size={20} />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* BỘ LỌC TINH GỌN - VERSION SANG TRỌNG */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* 1. Tìm tên thí sinh */}
          <div className="md:col-span-3 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              Tìm kiếm
            </span>
            <div className="relative group">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Tên thí sinh..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 2. Trạng thái */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              Trạng thái
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none"
            >
              <option value="all">🎯 Tất cả trạng thái</option>
              <option value="graded">✅ Đã chấm điểm</option>
              <option value="pending">⏳ Đang chờ chấm</option>
            </select>
          </div>

          {/* 3. Phân loại bài làm */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              Lọc bài thi
            </span>
            <select
              value={extremeFilter}
              onChange={(e) => setExtremeFilter(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none"
            >
              <option value="all">📑 Tất cả bài nộp</option>
              <option value="highest">🏆 Điểm cao nhất</option>
              <option value="lowest">📉 Điểm thấp nhất</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              Sắp xếp điểm
            </span>
            <div className="relative group">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all appearance-none"
              >
                {/* Icon hiển thị danh sách bên trong menu xổ xuống */}
                <option value="none">📊 Xếp hạng</option>
                <option value="asc">📈 Thấp ➔ Cao</option>
                <option value="desc">📉 Cao ➔ Thấp</option>
              </select>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* 5. Khoảng điểm */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
              Khoảng điểm
            </span>
            <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-2xl h-12 px-3 focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-500 focus-within:bg-white transition-all">
              <input
                type="number"
                placeholder="0"
                value={rangeMin}
                onChange={(e) => setRangeMin(e.target.value)}
                className="w-full bg-transparent text-center text-sm font-black text-slate-700 outline-none placeholder:text-slate-300"
              />
              <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
              <input
                type="number"
                placeholder="10"
                value={rangeMax}
                onChange={(e) => setRangeMax(e.target.value)}
                className="w-full bg-transparent text-center text-sm font-black text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Nút Reset */}
          <div className="md:col-span-1 flex items-center justify-center pb-3">
            <button
              onClick={() => {
                setStudentSearch("");
                setStatusFilter("all");
                setExtremeFilter("all");
                setRangeMin("");
                setRangeMax("");
                setSortOrder("none"); // 🌟 Reset luôn cả Sort
              }}
              className="group flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-rose-500 transition-all uppercase tracking-widest whitespace-nowrap"
            >
              <HiRefresh
                size={16}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
              <span>Tất cả</span>
            </button>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-left">
                <div className="flex items-center gap-2">
                  <span>Thí sinh</span>
                  {/* Badge số lượng bản ghi */}
                  <span className="bg-indigo-500 text-[9px] px-2 py-0.5 rounded-full ring-2 ring-indigo-400/20 shadow-sm animate-in fade-in zoom-in duration-300">
                    {filteredSubmissions.length} bản ghi
                  </span>
                </div>
              </th>

              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-center">
                Trắc nghiệm
              </th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-center">
                Tự luận
              </th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-center">
                Tổng điểm
              </th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest">
                Trạng thái
              </th>
              <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentData.map((s) => (
              <tr
                key={s._id}
                className="hover:bg-indigo-50/20 transition-colors group"
              >
                <td className="p-5">
                  <div className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {s.student?.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {s.student?.email}
                  </div>
                </td>
                <td className="p-5 text-center font-bold text-slate-600">
                  {s.scoreAuto}đ
                </td>
                <td className="p-5 text-center font-bold text-slate-600">
                  {s.scoreManual !== undefined ? `${s.scoreManual}đ` : "—"}
                </td>
                <td className="p-5 text-center">
                  <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black shadow-sm inline-block min-w-[60px]">
                    {s.scoreAuto + (s.scoreManual || 0)}đ
                  </span>
                </td>
                <td className="p-5">
                  {s.status === "graded" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Đã chấm
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Chờ chấm
                    </span>
                  )}
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Nút Chấm bài */}
                    <button
                      onClick={() => navigate(`/grade-submission/${s._id}`)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all active:scale-90 text-white ${
                        s.status === "graded"
                          ? "bg-slate-500 hover:bg-indigo-600"
                          : "bg-slate-900 hover:bg-indigo-600"
                      }`}
                    >
                      {s.status === "graded" ? "Sửa điểm →" : "Chấm bài →"}
                    </button>

                    {/* Nút Xóa bài */}
                    <button
                      onClick={() => handleDelete(s._id, s.student?.name)}
                      className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all active:scale-90 border border-transparent hover:border-rose-100"
                      title="Xóa bài nộp"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubmissions.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-slate-300">🔍</span>
            </div>
            <p className="text-slate-400 font-bold text-lg">
              Không tìm thấy bài nộp nào
            </p>
            <p className="text-slate-300 text-sm">
              Hãy thử thay đổi bộ lọc của bạn
            </p>
          </div>
        )}

        {/*  */}
        <Pagination
          currentPage={currentPage}
          maxPage={maxPage}
          next={next}
          prev={prev}
          jump={jump}
        />
      </div>
    </div>
  );
};

export default ExamSubmissions;
