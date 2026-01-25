import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx"; // Import thư viện Excel

const ExamSubmissions = () => {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [examTitle, setExamTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/submissions/exam/${examId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSubmissions(res.data);
      if (res.data.length > 0) setExamTitle(res.data[0].exam.title);
    };
    fetchData();
  }, [examId]);

  // Hàm xử lý xuất Excel
  const exportToExcel = () => {
    // Kiểm tra nếu chưa có dữ liệu thì không cho xuất
    if (!submissions || submissions.length === 0) {
      alert("Không có dữ liệu để xuất file!");
      return;
    }

    const dataToExport = submissions.map((s, idx) => ({
      STT: idx + 1,
      "Họ tên": s.student?.name || "N/A",
      Email: s.student?.email || "N/A",
      "Điểm trắc nghiệm": s.scoreAuto,
      "Điểm tự luận": s.scoreManual || 0,
      "Tổng điểm": s.scoreAuto + (s.scoreManual || 0),
      "Thời gian làm (giây)": s.timeSpent,
      "Ngày nộp": new Date(s.createdAt).toLocaleString("vi-VN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kết quả");

    const fileName = examTitle ? examTitle.replace(/\s+/g, "_") : "Ket_qua_thi";
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            Danh sách bài nộp
          </h2>
          <p className="text-slate-500">Đề thi: {examTitle}</p>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg"
        >
          📊 Xuất file Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-600">Thí sinh</th>
              <th className="p-4 font-bold text-slate-600">Điểm TN</th>
              <th className="p-4 font-bold text-slate-600">Điểm TL</th>
              <th className="p-4 font-bold text-slate-600">Tổng điểm</th>
              <th className="p-4 font-bold text-slate-600">Thời gian</th>
              <th className="p-4 font-bold text-slate-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr
                key={s._id}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition"
              >
                <td className="p-4">
                  <p className="font-bold text-slate-800">{s.student.name}</p>
                  <p className="text-xs text-slate-400">{s.student.email}</p>
                </td>
                <td className="p-4 font-medium text-blue-600">
                  {s.scoreAuto}đ
                </td>
                <td className="p-4 font-medium text-orange-600">
                  {s.scoreManual || "Chưa chấm"}
                </td>
                <td className="p-4 font-black text-indigo-600 text-lg">
                  {s.scoreAuto + (s.scoreManual || 0)}đ
                </td>
                <td className="p-4 text-slate-500 text-sm">
                  {Math.floor(s.timeSpent / 60)}ph {s.timeSpent % 60}s
                </td>
                <td className="p-4">
                  <button
                    onClick={() => navigate(`/grade-submission/${s._id}`)}
                    className="text-indigo-600 hover:underline font-bold text-sm"
                  >
                    Chi tiết bài làm & Chấm điểm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            Chưa có thí sinh nào nộp bài.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSubmissions;
