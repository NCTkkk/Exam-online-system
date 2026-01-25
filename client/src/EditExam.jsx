import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineLanguage,
  HiOutlineChevronLeft,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineDocumentText,
  HiOutlineSquaresPlus,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(null);
  const lastFocusedElement = useRef(null);

  // 1. Tải dữ liệu cũ
  useEffect(() => {
    const fetchExam = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:5000/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitle(res.data.title);
        setDuration(res.data.duration);
        setQuestions(res.data.questions || []);
      } catch (err) {
        alert("Không thể tải dữ liệu đề thi");
      }
    };
    fetchExam();
  }, [id]);

  const handleBlur = (e) => {
    lastFocusedElement.current = e.target;
  };

  // 2. Logic Format văn bản
  const applyFormat = (type) => {
    const el = lastFocusedElement.current;
    if (!el) return alert("Vui lòng click vào ô văn bản cần định dạng trước!");

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const selected = val.substring(start, end);

    if (start === end) return alert("Bôi đen đoạn chữ cần định dạng!");

    const tag = type === "underline" ? "u" : "mark";
    const result =
      val.substring(0, start) +
      `<${tag}>${selected}</${tag}>` +
      val.substring(end);

    const nativeSetter =
      Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      ).set ||
      Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;

    nativeSetter.call(el, result);
    el.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + selected.length + tag.length * 2 + 5);
    }, 10);
  };

  // 3. Quản lý các loại câu hỏi
  const addMultipleChoice = () => {
    setQuestions([
      ...questions,
      {
        type: "multiple_choice",
        content: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1,
      },
    ]);
  };

  const addEssay = () => {
    setQuestions([
      ...questions,
      {
        type: "essay",
        content: "",
        correctAnswer: "", // Dùng làm đáp án gợi ý
        points: 2,
      },
    ]);
  };

  const addPassageGroup = () => {
    setQuestions([
      ...questions,
      {
        type: "passage_group",
        content: "Đọc đoạn văn sau và trả lời câu hỏi",
        passage: "",
        subQuestions: [
          {
            content: "",
            options: ["", "", "", ""],
            correctAnswer: "",
            points: 1,
          },
        ],
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (window.confirm("Xóa câu hỏi này?")) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addSubQuestion = (qIndex) => {
    const newQs = [...questions];
    newQs[qIndex].subQuestions.push({
      content: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    });
    setQuestions(newQs);
  };

  const removeSubQuestion = (qIndex, subIdx) => {
    const newQs = [...questions];
    newQs[qIndex].subQuestions.splice(subIdx, 1);
    setQuestions(newQs);
  };

  const getQuestionDisplayNum = (qIndex, subIdx = null) => {
    let currentNum = 0;
    for (let i = 0; i < qIndex; i++) {
      currentNum +=
        questions[i].type === "passage_group"
          ? questions[i].subQuestions?.length || 0
          : 1;
    }
    return subIdx !== null ? currentNum + subIdx + 1 : currentNum + 1;
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/exams/${id}`,
        { title, duration, questions },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Cập nhật đề thi thành công!");
      navigate("/manage-exams");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* HEADER & TOOLBAR */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto bg-blue-50 rounded-xl shadow-lg p-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <HiOutlineChevronLeft size={20} />
            </button>
            <input
              onBlur={handleBlur}
              className="text-xl font-black outline-none text-indigo-600 border-b-2 border-transparent focus:border-indigo-600 bg-transparent w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề đề thi..."
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormat("underline");
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm text-slate-700 font-bold hover:bg-indigo-600 hover:text-white transition-all text-[10px]"
            >
              <HiOutlineLanguage /> GẠCH CHÂN
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormat("highlight");
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm text-slate-700 font-bold hover:bg-yellow-500 hover:text-white transition-all text-[10px]"
            >
              <HiOutlineSparkles /> HIGHLIGHT
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border px-3 py-1.5 rounded-xl">
              <HiOutlineClock className="text-slate-400" />
              <input
                type="number"
                className="bg-transparent w-10 font-bold text-center outline-none"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <span className="text-[10px] font-bold text-slate-400">PHÚT</span>
            </div>
            <button
              onClick={handleUpdate}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg transition-all"
            >
              <HiOutlineCheckBadge size={20} /> CẬP NHẬT
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 px-4">
        <AnimatePresence>
          {questions.map((q, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-10 p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl relative"
            >
              {/* Question Header Tag */}
              <div
                className={`absolute -left-3 top-8 px-4 py-1.5 rounded-lg text-white font-black shadow-lg 
                ${q.type === "passage_group" ? "bg-purple-600" : q.type === "essay" ? "bg-orange-500" : "bg-indigo-600"}`}
              >
                {q.type === "passage_group"
                  ? `NHÓM CÂU ${getQuestionDisplayNum(index)} - ${getQuestionDisplayNum(index, q.subQuestions.length - 1)}`
                  : q.type === "essay"
                    ? `TỰ LUẬN ${getQuestionDisplayNum(index)}`
                    : `CÂU ${getQuestionDisplayNum(index)}`}
              </div>

              <button
                onClick={() => removeQuestion(index)}
                className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"
              >
                <HiOutlineTrash size={24} />
              </button>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Yêu cầu chính / Đề bài
                  </label>
                  <button
                    onClick={() =>
                      setPreviewIdx(previewIdx === index ? null : index)
                    }
                    className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1"
                  >
                    <HiOutlineEye />{" "}
                    {previewIdx === index ? "SỬA NỘI DUNG" : "XEM TRƯỚC"}
                  </button>
                </div>

                {previewIdx === index ? (
                  <div
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 min-h-15"
                    dangerouslySetInnerHTML={{ __html: q.content || "..." }}
                  />
                ) : (
                  <textarea
                    onBlur={handleBlur}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-100 border border-transparent focus:border-indigo-200 transition-all"
                    value={q.content}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[index].content = e.target.value;
                      setQuestions(newQs);
                    }}
                  />
                )}

                {/* --- HIỂN THỊ THEO LOẠI CÂU HỎI --- */}
                {q.type === "passage_group" ? (
                  /* GIAO DIỆN NHÓM BÀI ĐỌC */
                  <div className="mt-6 p-6 bg-purple-50/50 rounded-3xl border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-400 uppercase block mb-2">
                      Văn bản bài đọc
                    </span>
                    <textarea
                      onBlur={handleBlur}
                      className="w-full p-6 rounded-2xl min-h-40 outline-none font-serif text-lg bg-white shadow-sm focus:ring-2 ring-purple-200"
                      value={q.passage}
                      onChange={(e) => {
                        const newQs = [...questions];
                        newQs[index].passage = e.target.value;
                        setQuestions(newQs);
                      }}
                    />
                    <div className="mt-8 space-y-6">
                      {q.subQuestions.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="bg-white p-6 rounded-3xl border border-purple-100 shadow-md"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-black text-[10px]">
                              Câu {getQuestionDisplayNum(index, subIdx)}
                            </span>
                            <button
                              onClick={() => removeSubQuestion(index, subIdx)}
                              className="text-slate-300 hover:text-red-500"
                            >
                              <HiOutlineTrash size={18} />
                            </button>
                          </div>
                          <input
                            onBlur={handleBlur}
                            className="w-full p-2 border-b-2 font-bold outline-none border-slate-50 focus:border-purple-400 mb-4"
                            value={sub.content}
                            placeholder="Câu hỏi con..."
                            onChange={(e) => {
                              const newQs = [...questions];
                              newQs[index].subQuestions[subIdx].content =
                                e.target.value;
                              setQuestions(newQs);
                            }}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            {sub.options.map((opt, optIdx) => (
                              <div key={optIdx} className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <input
                                  onBlur={handleBlur}
                                  className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:bg-white border border-transparent focus:border-purple-100"
                                  value={opt}
                                  placeholder="Đáp án..."
                                  onChange={(e) => {
                                    const newQs = [...questions];
                                    newQs[index].subQuestions[subIdx].options[
                                      optIdx
                                    ] = e.target.value;
                                    setQuestions(newQs);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-4">
                            <select
                              className="flex-1 p-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[10px] outline-none"
                              value={sub.correctAnswer}
                              onChange={(e) => {
                                const newQs = [...questions];
                                newQs[index].subQuestions[
                                  subIdx
                                ].correctAnswer = e.target.value;
                                setQuestions(newQs);
                              }}
                            >
                              <option value="">-- ĐÁP ÁN ĐÚNG --</option>
                              {sub.options.map((o, i) => (
                                <option key={i} value={o}>
                                  {o ||
                                    `Lựa chọn ${String.fromCharCode(65 + i)}`}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              className="w-20 p-2 bg-slate-50 text-center font-black rounded-xl text-purple-600 outline-none"
                              value={sub.points}
                              onChange={(e) => {
                                const newQs = [...questions];
                                newQs[index].subQuestions[subIdx].points =
                                  Number(e.target.value);
                                setQuestions(newQs);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addSubQuestion(index)}
                        className="w-full py-3 border-2 border-dashed border-purple-200 rounded-2xl text-purple-400 font-black hover:bg-white flex items-center justify-center gap-2"
                      >
                        <HiOutlinePlus /> THÊM CÂU HỎI CON
                      </button>
                    </div>
                  </div>
                ) : q.type === "essay" ? (
                  /* GIAO DIỆN CÂU TỰ LUẬN */
                  <div className="mt-8 space-y-4">
                    <label className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
                      Gợi ý đáp án (Dành cho giáo viên)
                    </label>
                    <textarea
                      onBlur={handleBlur}
                      className="w-full p-4 bg-orange-50/30 rounded-2xl border border-orange-100 outline-none focus:ring-2 ring-orange-100 min-h-[150px] italic text-slate-600 shadow-inner"
                      placeholder="Nhập hướng dẫn chấm bài hoặc đáp án mẫu tại đây..."
                      value={q.correctAnswer}
                      onChange={(e) => {
                        const newQs = [...questions];
                        newQs[index].correctAnswer = e.target.value;
                        setQuestions(newQs);
                      }}
                    />
                    <div className="flex justify-end">
                      <div className="w-32 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border p-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase mb-1">
                          Điểm số
                        </span>
                        <input
                          type="number"
                          className="w-full bg-transparent font-black text-center text-lg outline-none"
                          value={q.points}
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[index].points = Number(e.target.value);
                            setQuestions(newQs);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* GIAO DIỆN TRẮC NGHIỆM ĐƠN */
                  <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all"
                        >
                          <span className="pl-4 font-black text-slate-300 text-sm">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <input
                            onBlur={handleBlur}
                            className="w-full p-3 bg-transparent outline-none text-sm"
                            value={opt}
                            placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                            onChange={(e) => {
                              const newQs = [...questions];
                              newQs[index].options[i] = e.target.value;
                              setQuestions(newQs);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <select
                        className="flex-1 p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-xs outline-none border border-emerald-100"
                        value={q.correctAnswer}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[index].correctAnswer = e.target.value;
                          setQuestions(newQs);
                        }}
                      >
                        <option value="">-- CHỌN ĐÁP ÁN ĐÚNG --</option>
                        {q.options.map((o, i) => (
                          <option key={i} value={o}>
                            {o || `Lựa chọn ${String.fromCharCode(65 + i)}`}
                          </option>
                        ))}
                      </select>
                      <div className="w-full md:w-32 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border p-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase mb-1">
                          Điểm số
                        </span>
                        <input
                          type="number"
                          className="w-full bg-transparent font-black text-center text-lg outline-none"
                          value={q.points}
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[index].points = Number(e.target.value);
                            setQuestions(newQs);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* --- FLOATING ACTIONS --- */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-2xl border border-indigo-100 p-2 rounded-2xl flex gap-2 z-[60]">
          <button
            onClick={addMultipleChoice}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            <HiOutlineDocumentText size={20} />{" "}
            <span className="text-xs">TRẮC NGHIỆM</span>
          </button>

          <button
            onClick={addEssay}
            className="flex items-center gap-2 px-4 py-3 bg-orange-200 text-orange-600 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm"
          >
            <HiOutlinePencilSquare size={20} />{" "}
            <span className="text-xs">TỰ LUẬN</span>
          </button>

          <button
            onClick={addPassageGroup}
            className="flex items-center gap-2 px-4 py-3 bg-purple-200 text-purple-600 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
          >
            <HiOutlineSquaresPlus size={20} />{" "}
            <span className="text-xs">NHÓM BÀI ĐỌC</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExam;
