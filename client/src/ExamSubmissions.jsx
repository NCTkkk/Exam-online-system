import React, { useState, useEffect } from "react";

import axios from "axios";
import * as XLSX from "xlsx"; // Import thư viện Excel
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineFilter, HiOutlineDownload, HiRefresh } from "react-icons/hi";

const ExamSubmissions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [examTitle, setExamTitle] = useState("");

  // --- STATES BỘ LỌC ---
  const [scoreType, setScoreType] = useState("total"); // total, auto, manual
  const [filterType, setFilterType] = useState("exact"); // exact, range
  const [exactValue, setExactValue] = useState("");
  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        // 1. Gọi API lấy danh sách bài nộp
        const resSubmissions = await axios.get(
          `http://localhost:5000/api/submissions/exam/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSubmissions(resSubmissions.data);

        // 2. Gọi thêm API lấy thông tin Exam để lấy tiêu đề chuẩn
        // Giả sử bạn có route: GET /api/exams/:id
        const resExam = await axios.get(
          `http://localhost:5000/api/exams/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setExamTitle(resExam.data.title);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        // Nếu API Exam lỗi (đề bị xóa), hãy lấy từ bài nộp đầu tiên như phương án dự phòng
        if (submissions.length > 0) {
          setExamTitle(submissions[0].exam?.title || "Đề thi đã bị xóa");
        } else {
          setExamTitle("Không tìm thấy thông tin đề thi");
        }
      }
    };
    fetchData();
  }, [examId]);

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredSubmissions = submissions.filter((s) => {
    // 1. Xác định giá trị điểm cần lọc (Ép kiểu về Number để tính toán chính xác)
    let targetScore = 0;
    const auto = Number(s.scoreAuto) || 0;
    const manual = Number(s.scoreManual) || 0;

    if (scoreType === "total") targetScore = auto + manual;
    else if (scoreType === "auto") targetScore = auto;
    else if (scoreType === "manual") targetScore = manual;

    // 2. Kiểm tra điều kiện lọc
    if (filterType === "exact") {
      // Nếu ô nhập trống thì không lọc (hiện tất cả)
      if (exactValue === "") return true;
      return targetScore === Number(exactValue);
    } else {
      // Khoảng điểm: Nếu để trống thì mặc định là 0 đến 10
      const min = rangeMin === "" ? 0 : Number(rangeMin);
      const max = rangeMax === "" ? 10 : Number(rangeMax);
      return targetScore >= min && targetScore <= max;
    }
  });

  // Hàm xử lý xuất Excel
  const exportToExcel = () => {
    if (filteredSubmissions.length === 0) {
      alert("Không có dữ liệu phù hợp để xuất file!");
      return;
    }
    const dataToExport = filteredSubmissions.map((s, idx) => ({
      STT: idx + 1,
      "Họ tên": s.student?.name || "N/A",
      "Điểm TN": s.scoreAuto,
      "Điểm TL": s.scoreManual || 0,
      "Tổng điểm": s.scoreAuto + (s.scoreManual || 0),
      "Ngày nộp": new Date(s.createdAt).toLocaleString("vi-VN"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kết quả");
    XLSX.writeFile(workbook, `${examTitle.replace(/\s+/g, "_")}_Loc.xlsx`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            Danh sách bài nộp
          </h2>
          <p className="text-slate-700">Đề thi: {examTitle}</p>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg"
        >
          📊 Xuất file Excel
        </button>
      </div>

      {/* bộ lọc */}
      {/* THANH BỘ LỌC (FILTER BAR) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <HiOutlineFilter size={22} />
          <span>LỌC KẾT QUẢ:</span>
        </div>

        {/* Chọn loại điểm */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-slate-400">
            Loại điểm
          </label>
          <select
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="total">Tổng điểm</option>
            <option value="auto">Điểm trắc nghiệm</option>
            <option value="manual">Điểm tự luận</option>
          </select>
        </div>

        {/* Chọn kiểu lọc */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-slate-400">
            Kiểu lọc
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="exact">Điểm cụ thể</option>
            <option value="range">Khoảng điểm</option>
          </select>
        </div>

        {/* Nhập giá trị */}
        <div className="flex items-end gap-3">
          {filterType === "exact" ? (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Số điểm
              </label>
              <input
                type="number"
                placeholder="0"
                step="0.1"
                value={exactValue}
                onChange={(e) => setExactValue(e.target.value)}
                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Từ
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={rangeMin}
                  onChange={(e) => setRangeMin(e.target.value)}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="mb-2 font-bold text-slate-300">-</span>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Đến
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={rangeMax}
                  onChange={(e) => setRangeMax(e.target.value)}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <button
            onClick={() => {
              setExactValue("");
              setRangeMin("");
              setRangeMax("");
            }}
            className="group h-[40px] w-[40px] ml-3 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
          >
            <HiRefresh className="w-4 h-4 transition-transform duration-300 " />
          </button>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-5 font-bold uppercase text-xs tracking-widest">
                Thí sinh
              </th>
              <th className="p-5 font-bold uppercase text-xs tracking-widest text-center">
                Trắc nghiệm
              </th>
              <th className="p-5 font-bold uppercase text-xs tracking-widest text-center">
                Tự luận
              </th>
              <th className="p-5 font-bold uppercase text-xs tracking-widest text-center">
                Tổng
              </th>
              <th className="p-5 font-bold uppercase text-xs tracking-widest">
                Thời gian
              </th>
              <th className="p-5 font-bold uppercase text-xs tracking-widest">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((s) => (
              <tr
                key={s._id}
                className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors"
              >
                <td className="p-5">
                  <div className="font-black text-slate-800">
                    {s.student?.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {s.student?.email}
                  </div>
                </td>
                <td className="p-5 text-center font-bold text-blue-600 bg-blue-50/20">
                  {s.scoreAuto}đ
                </td>
                <td className="p-5 text-center font-bold text-orange-600">
                  {s.scoreManual || 0}đ
                </td>
                <td className="p-5 text-center">
                  <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black shadow-sm">
                    {s.scoreAuto + (s.scoreManual || 0)}đ
                  </span>
                </td>
                <td className="p-5 text-slate-500 font-medium text-sm">
                  {Math.floor(s.timeSpent / 60)}ph {s.timeSpent % 60}s
                </td>
                <td className="p-5">
                  <button
                    onClick={() => navigate(`/grade-submission/${s._id}`)}
                    className="text-indigo-600 hover:text-indigo-800 font-black text-sm flex items-center gap-1 transition-transform active:scale-95"
                  >
                    CHẤM ĐIỂM →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubmissions.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <span className="text-5xl">🔍</span>
            <p className="text-slate-400 font-bold text-xl">
              Không tìm thấy kết quả phù hợp
            </p>
            <button
              onClick={() => {
                setExactValue("");
                setRangeMin("");
                setRangeMax("");
              }}
              className="text-indigo-600 font-bold underline"
            >
              Hiển thị lại tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSubmissions;
