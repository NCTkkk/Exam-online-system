import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineTrophy,
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineUserCircle,
  HiOutlineChevronDown,
} from "react-icons/hi2";

const Leaderboard = () => {
  const [exams, setExams] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(""); // Lưu nội dung người dùng nhập

  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/exams").then((res) => {
      // KIỂM TRA 1: Dữ liệu thô từ server trả về có trường subject không?

      setExams(res.data);
    });
  }, []);

  const subjects = [...new Set(exams.map((ex) => ex.subject).filter(Boolean))];

  // Lọc danh sách đề thi dựa trên tên môn học đang nhập
  const filteredExams = exams.filter((ex) => {
    const examSubject = ex.subject ? String(ex.subject).toLowerCase() : "";
    const filterText = subjectFilter.toLowerCase();
    return examSubject.includes(filterText); // Trả về true nếu tên môn chứa chuỗi đang nhập
  });

  const handleExamChange = async (examId) => {
    if (!examId) return;
    setSelectedExam(examId);

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/submissions/leaderboard/${examId}`,
      );
      setRankings(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Tách Top 3 và phần còn lại
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-yellow-100 rounded-3xl text-yellow-600 mb-4 shadow-xl shadow-yellow-100/50"
          >
            <HiOutlineTrophy size={40} />
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">
            Bảng Vàng <span className="text-indigo-600">Danh Dự</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Vinh danh những học viên có thành tích xuất sắc nhất
          </p>
        </div>

        {/* BỘ LỌC HAI CẤP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          {/* Ô NHẬP TÊN MÔN ĐỂ LỌC */}
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập tên môn (VD: Toán, Anh...)"
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setSelectedExam(""); // Reset đề thi đang chọn khi gõ lọc mới
                setRankings([]);
              }}
              className="w-full p-4 rounded-3xl border-none bg-emerald-50 shadow-lg shadow-emerald-100/50 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-emerald-700 transition-all placeholder:text-emerald-300"
            />
            {/* Icon tìm kiếm cho sinh động */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Ô CHỌN ĐỀ THI (Danh sách này đã được thu hẹp theo tên môn ở trên) */}
          <div className="relative">
            <select
              value={selectedExam}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full appearance-none p-4 rounded-3xl border-none bg-white shadow-xl shadow-indigo-100/50 focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-indigo-700 cursor-pointer pr-12 transition-all"
            >
              <option value="">
                --{" "}
                {filteredExams.length > 0 ? "Chọn đề thi" : "Không tìm thấy đề"}{" "}
                --
              </option>
              {filteredExams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.title} {ex.subject ? `(${ex.subject})` : ""}
                </option>
              ))}
            </select>
            <HiOutlineChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">
              Đang lập bảng xếp hạng...
            </p>
          </div>
        ) : rankings.length > 0 ? (
          <div className="space-y-8">
            {/* TOP 3 PODIUM */}
            <div className="grid grid-cols-3 gap-2 items-end mb-16 pt-10">
              {/* RANK 2 */}
              {top3[1] && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  delay={0.2}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-400">
                      <HiOutlineUserCircle size={60} />
                    </div>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                      2
                    </span>
                  </div>
                  <p className="font-bold text-slate-700 text-sm truncate w-full text-center">
                    {top3[1].studentName}
                  </p>
                  <p className="text-indigo-600 font-black">
                    {top3[1].totalScore}đ
                  </p>
                </motion.div>
              )}

              {/* RANK 1 */}
              {top3[0] && (
                <motion.div
                  initial={{ y: 0, scale: 0.8, opacity: 0 }}
                  animate={{ y: -20, scale: 1.1, opacity: 1 }}
                  className="flex flex-col items-center z-10"
                >
                  <div className="relative mb-4">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                      <HiOutlineFire size={32} />
                    </div>
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-yellow-400 rounded-full border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center text-yellow-100 ring-8 ring-yellow-400/20">
                      <HiOutlineUserCircle size={80} />
                    </div>
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 border-white">
                      1
                    </span>
                  </div>
                  <p className="font-black text-slate-900 text-lg truncate w-full text-center">
                    {top3[0].studentName}
                  </p>
                  <p className="text-yellow-600 font-black text-xl">
                    {top3[0].totalScore}đ
                  </p>
                </motion.div>
              )}

              {/* RANK 3 */}
              {top3[2] && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  delay={0.4}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-orange-300">
                      <HiOutlineUserCircle size={60} />
                    </div>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                      3
                    </span>
                  </div>
                  <p className="font-bold text-slate-700 text-sm truncate w-full text-center">
                    {top3[2].studentName}
                  </p>
                  <p className="text-indigo-600 font-black">
                    {top3[2].totalScore}đ
                  </p>
                </motion.div>
              )}
            </div>

            {/*  */}
            {/* LIST REST */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white">
              <table className="w-full border-collapse">
                <tbody>
                  {rest.map((r, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-6 text-center w-20">
                        <span className="font-black text-slate-300 text-lg">
                          #{idx + 4}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
                            <HiOutlineUserCircle size={24} />
                          </div>
                          <p className="font-black text-slate-700">
                            {r.studentName}
                          </p>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <p className="text-xl font-black text-indigo-600 leading-none">
                          {r.totalScore}đ
                        </p>
                        <p className="text-[10px] font-black text-slate-300 uppercase mt-1 flex items-center justify-end gap-1">
                          <HiOutlineClock /> {formatTime(r.timeSpent)}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4 grayscale opacity-30">🏆</div>
            <h3 className="text-xl font-black text-slate-800 italic">
              Chưa có "chiến binh" nào khai hỏa!
            </h3>
            <p className="text-slate-400 font-medium">
              Hãy là người đầu tiên ghi danh lên bảng vàng nhé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
