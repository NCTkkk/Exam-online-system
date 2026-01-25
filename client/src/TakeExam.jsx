import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  HiOutlineClock,
  HiOutlineClipboardDocumentCheck,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiChevronRight,
  HiCheckBadge,
} from "react-icons/hi2";

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Tránh nộp 2 lần
  const timerRef = useRef();

  // 1. Logic Fetch Data
  useEffect(() => {
    const fetchExam = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:5000/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExam(res.data);
        setTimeLeft(res.data.duration * 60);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Không thể tải đề thi. Vui lòng kiểm tra kết nối!");
      }
    };
    if (id) fetchExam();

    const handleVisibility = () => {
      if (document.hidden) console.warn("User tab switched");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [id]);

  // 2. Logic Timer
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(
        () => setTimeLeft((prev) => prev - 1),
        1000,
      );
    } else if (timeLeft === 0 && exam && !isSubmitting) {
      autoSubmitExam();
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, exam, isSubmitting]);

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const processSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    clearInterval(timerRef.current);

    const token = localStorage.getItem("token");
    // Kiểm tra kỹ định dạng ID (q._id hoặc q.id)
    const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
      questionId: key,
      content: value,
    }));

    try {
      await axios.post(
        `http://localhost:5000/api/submissions/submit`,
        {
          examId: id,
          answers: formattedAnswers,
          timeSpent: exam.duration * 60 - timeLeft,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Đã nộp bài thành công!");
      navigate("/view-results");
    } catch (err) {
      setIsSubmitting(false);
      const errMsg = err.response?.data?.message || err.message;
      alert("Lỗi khi nộp bài: " + errMsg);
    }
  };

  const submitExam = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    await processSubmit();
  };

  const autoSubmitExam = async () => {
    alert("Hết giờ làm bài! Hệ thống sẽ tự động nộp bài.");
    await processSubmit();
  };

  if (!exam)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="mt-4 text-slate-500 font-bold uppercase tracking-widest">
          Đang tải đề thi...
        </div>
      </div>
    );

  let cumulativeQuestionNumber = 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      <style>{`
        mark { background-color: #fef08a; color: #854d0e; padding: 0 2px; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg">
              <HiOutlineClipboardDocumentCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {exam.title}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                Đang thực hiện
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${timeLeft < 300 ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-slate-900 border-slate-800 text-white shadow-xl"}`}
          >
            <HiOutlineClock size={20} />
            <span className="text-2xl font-mono font-black">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 px-4 space-y-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700 text-sm font-medium"
        >
          <HiOutlineExclamationTriangle size={20} /> Hệ thống đang giám sát.
          Không chuyển tab.
        </motion.div>

        {exam.questions.map((q, idx) => {
          // Unique ID check: Ưu tiên dùng _id nếu có, không thì dùng id
          const mainId = q._id || q.id;

          if (q.type === "instruction") {
            return (
              <div
                key={idx}
                className="max-w-4xl mx-auto bg-slate-100/50 border-2 border-dashed border-slate-200 p-6 rounded-3xl flex items-start gap-4"
              >
                <div className="bg-white p-2 rounded-xl text-slate-400 shadow-sm">
                  <HiOutlineInformationCircle size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Hướng dẫn làm bài
                  </h4>
                  <div
                    className="text-slate-600 font-medium"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />
                </div>
              </div>
            );
          }

          if (q.type === "passage_group") {
            return (
              <div
                key={idx}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
              >
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 lg:sticky lg:top-28 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  <span className="bg-purple-100 text-purple-700 text-[10px] px-3 py-1 rounded-full font-black uppercase mb-4 inline-block">
                    Reading Passage
                  </span>
                  <h2
                    className="text-xl font-black text-slate-800 mb-6"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />
                  <div
                    className="prose prose-slate max-w-none text-slate-600 font-serif text-lg"
                    dangerouslySetInnerHTML={{ __html: q.passage }}
                  />
                </div>
                <div className="space-y-6">
                  {q.subQuestions?.map((sub, sIdx) => {
                    cumulativeQuestionNumber++;
                    const subId = sub._id || sub.id;
                    const isAnswered = !!answers[subId];
                    return (
                      <div
                        key={subId || sIdx}
                        className={`bg-white p-8 rounded-4xl shadow-md border-2 transition-all ${isAnswered ? "border-purple-100" : "border-slate-50"}`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-purple-600 font-black text-sm uppercase">
                            CÂU {cumulativeQuestionNumber}
                          </span>
                          {isAnswered && (
                            <HiCheckBadge
                              className="text-emerald-500"
                              size={20}
                            />
                          )}
                        </div>
                        <p className="font-bold text-slate-800 text-lg mb-6">
                          {sub.content}
                        </p>
                        <div className="grid gap-3">
                          {sub.options.map((opt, i) => (
                            <label
                              key={i}
                              className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${answers[subId] === opt ? "border-purple-500 bg-purple-50" : "border-slate-50 hover:bg-slate-50"}`}
                            >
                              <input
                                type="radio"
                                name={subId}
                                checked={answers[subId] === opt}
                                onChange={() => handleAnswerChange(subId, opt)}
                                className="w-5 h-5 text-purple-600"
                              />
                              <span className="ml-4 font-medium">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Single Question
          cumulativeQuestionNumber++;
          const isAnswered = !!answers[mainId];
          return (
            <div
              key={mainId || idx}
              className="max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 w-2 h-full transition-colors ${isAnswered ? "bg-emerald-500" : "bg-indigo-500"}`}
              />
              <div className="flex justify-between items-center mb-4">
                <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                  Câu hỏi {cumulativeQuestionNumber}
                </span>
                {isAnswered && (
                  <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded">
                    ĐÃ TRẢ LỜI
                  </span>
                )}
              </div>
              <div
                className="text-xl font-bold text-slate-800 mb-8"
                dangerouslySetInnerHTML={{ __html: q.content }}
              />
              {q.type === "multiple_choice" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${answers[mainId] === opt ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-slate-50 hover:border-indigo-200 hover:bg-slate-50"}`}
                    >
                      <input
                        type="radio"
                        name={mainId}
                        checked={answers[mainId] === opt}
                        onChange={() => handleAnswerChange(mainId, opt)}
                        className="w-6 h-6 text-indigo-600"
                      />
                      <span className="ml-4 font-bold text-slate-700">
                        <span className="mr-2 opacity-30">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl focus:border-indigo-400 focus:bg-white outline-none transition-all font-medium text-slate-700 min-h-[200px]"
                  placeholder="Nhập câu trả lời..."
                  value={answers[mainId] || ""}
                  onChange={(e) => handleAnswerChange(mainId, e.target.value)}
                />
              )}
            </div>
          );
        })}

        {/* Submit */}
        <div className="max-w-4xl mx-auto pt-10 border-t border-slate-100">
          <button
            onClick={submitExam}
            disabled={isSubmitting}
            className={`group relative w-full flex items-center justify-center text-white text-xl font-black py-8 rounded-[2.5rem] transition-all shadow-2xl active:scale-[0.98] overflow-hidden ${isSubmitting ? "bg-slate-400" : "bg-slate-900 hover:bg-indigo-600"}`}
          >
            <span className="relative z-10 flex items-center gap-3">
              {isSubmitting ? "ĐANG NỘP BÀI..." : "NỘP BÀI HOÀN TẤT"}{" "}
              <HiChevronRight size={24} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
