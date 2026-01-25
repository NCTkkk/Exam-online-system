import React, { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineTrash,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineBookOpen,
  HiOutlineRocketLaunch,
  HiOutlineClock,
  HiOutlineLanguage,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineCheckBadge,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

const CreateExam = () => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(null);

  const lastFocusedElement = useRef(null);

  // Ghi nhận ô nhập liệu cuối cùng để biết apply format vào đâu
  const handleBlur = (e) => {
    lastFocusedElement.current = e.target;
  };

  const applyFormat = (type) => {
    const el = lastFocusedElement.current;
    if (!el) return alert("Hãy click vào ô văn bản cần định dạng trước!");

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const selected = val.substring(start, end);

    if (start === end) return alert("Vui lòng bôi đen đoạn chữ cần định dạng!");

    const tag = type === "underline" ? "u" : "mark";
    const result =
      val.substring(0, start) +
      `<${tag}>${selected}</${tag}>` +
      val.substring(end);

    // Cập nhật trực tiếp vào DOM để giữ vị trí con trỏ
    const setter =
      Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      ).set ||
      Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
    setter.call(el, result);
    el.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + selected.length + tag.length * 2 + 5);
    }, 10);
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

  const updateQuestion = (index, payload) => {
    setQuestions((prev) => {
      const newQs = [...prev];
      newQs[index] = { ...newQs[index], ...payload };
      return newQs;
    });
  };

  const updateSubQuestion = (qIdx, subIdx, payload) => {
    setQuestions((prev) => {
      const newQs = [...prev];
      const newSubQs = [...newQs[qIdx].subQuestions];
      newSubQs[subIdx] = { ...newSubQs[subIdx], ...payload };
      newQs[qIdx] = { ...newQs[qIdx], subQuestions: newSubQs };
      return newQs;
    });
  };

  const addMultipleChoice = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
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
      { id: Date.now(), type: "essay", content: "", points: 5 },
    ]);
  };

  const addPassageGroup = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        type: "passage_group",
        content: "Đọc đoạn văn sau và trả lời các câu hỏi:",
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

  const handleSubmit = async () => {
    if (!title) return alert("Vui lòng nhập tiêu đề đề thi!");
    if (questions.length === 0) return alert("Đề thi chưa có câu hỏi nào!");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/exams/create",
        { title, duration, questions },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Đề thi đã được lưu thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-40 font-sans text-slate-900">
      {/* HEADER BAR */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <input
          className="text-xl font-black outline-none border-b-2 border-transparent focus:border-indigo-600 bg-transparent w-full md:w-1/3 transition-all"
          placeholder="NHẬP TÊN ĐỀ THI..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("underline");
            }}
            className="px-4 py-2 bg-white rounded-xl shadow-sm text-indigo-700 font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all active:scale-95"
          >
            <HiOutlineLanguage /> <u>U</u>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("highlight");
            }}
            className="px-4 py-2 bg-white rounded-xl shadow-sm text-yellow-700 font-bold flex items-center gap-2 hover:bg-yellow-50 transition-all active:scale-95"
          >
            <HiOutlineSparkles />{" "}
            <mark className="bg-yellow-200 px-1 rounded">H</mark>
          </button>
        </div>

        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-slate-600 border border-slate-200 shadow-sm">
            <HiOutlineClock className="text-indigo-500" />
            <input
              type="number"
              className="w-12 bg-transparent outline-none text-center"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span className="text-sm">phút</span>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <HiOutlineRocketLaunch /> LƯU ĐỀ
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-10 px-4">
        <AnimatePresence mode="popLayout">
          {questions.map((q, index) => (
            <motion.div
              key={q.id || index}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="mb-8 p-6 md:p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl relative"
            >
              {/* Loại câu hỏi label */}
              <div
                className={`absolute -left-3 top-8 px-5 py-2 rounded-r-2xl text-white font-black shadow-lg z-10 ${
                  q.type === "passage_group"
                    ? "bg-purple-600"
                    : q.type === "essay"
                      ? "bg-blue-600"
                      : "bg-emerald-600"
                }`}
              >
                {q.type === "passage_group"
                  ? "PHẦN BÀI ĐỌC"
                  : `CÂU ${getQuestionDisplayNum(index)}`}
              </div>

              {/* Nút xóa */}
              <button
                onClick={() =>
                  setQuestions(questions.filter((_, i) => i !== index))
                }
                className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
              >
                <HiOutlineTrash size={24} />
              </button>

              <div className="mt-12 space-y-6">
                {/* 1. NỘI DUNG/CHỈ DẪN */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <HiOutlinePencilSquare />{" "}
                      {q.type === "passage_group"
                        ? "Yêu cầu bài đọc"
                        : "Nội dung câu hỏi"}
                    </label>
                    <button
                      onClick={() =>
                        setPreviewIdx(previewIdx === index ? null : index)
                      }
                      className={`text-xs font-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        previewIdx === index
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <HiOutlineEye size={16} />{" "}
                      {previewIdx === index ? "SỬA NỘI DUNG" : "XEM TRƯỚC"}
                    </button>
                  </div>

                  {previewIdx === index ? (
                    <div
                      className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-200 min-h-[100px] prose prose-indigo max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: q.content || "<i>Trống...</i>",
                      }}
                    />
                  ) : (
                    <textarea
                      onBlur={handleBlur}
                      className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-100 min-h-[80px] border border-transparent focus:border-indigo-200 transition-all font-medium text-lg"
                      value={q.content}
                      onChange={(e) =>
                        updateQuestion(index, { content: e.target.value })
                      }
                      placeholder="Nhập yêu cầu hoặc câu hỏi... (Bôi đen văn bản để gạch chân/highlight)"
                    />
                  )}
                </div>

                {/* 2. HIỂN THỊ CHI TIẾT THEO LOẠI */}
                {q.type === "multiple_choice" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 focus-within:border-indigo-300 focus-within:bg-white transition-all shadow-sm"
                      >
                        <span className="pl-4 font-black text-indigo-400">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <input
                          onBlur={handleBlur}
                          className="w-full p-3 bg-transparent outline-none font-medium"
                          placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}...`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[i] = e.target.value;
                            updateQuestion(index, { options: newOpts });
                          }}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 flex flex-col md:flex-row gap-4 pt-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-emerald-600 ml-2 mb-1 block uppercase">
                          Đáp án đúng
                        </label>
                        <select
                          className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold outline-none border border-emerald-100 cursor-pointer"
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(index, {
                              correctAnswer: e.target.value,
                            })
                          }
                        >
                          <option value="">-- CHỌN ĐÁP ÁN ĐÚNG --</option>
                          {q.options.map((o, i) => (
                            <option key={i} value={o}>
                              {o
                                ? `${String.fromCharCode(65 + i)}. ${o}`
                                : `Lựa chọn ${String.fromCharCode(65 + i)} (Trống)`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:w-32">
                        <label className="text-[10px] font-black text-slate-400 ml-2 mb-1 block uppercase text-center">
                          Số điểm
                        </label>
                        <input
                          type="number"
                          className="w-full p-4 bg-slate-100 rounded-2xl text-center font-black focus:bg-white border border-transparent focus:border-indigo-200 transition-all"
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(index, {
                              points: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {q.type === "passage_group" && (
                  <div className="p-4 md:p-8 bg-purple-50 rounded-[2rem] border border-purple-100">
                    <label className="text-xs font-black text-purple-400 block mb-3 uppercase tracking-widest">
                      Văn bản bài đọc
                    </label>
                    {previewIdx === index ? (
                      <div
                        className="p-6 bg-white rounded-3xl border-2 border-dashed border-purple-200 min-h-[200px] font-serif text-lg leading-relaxed shadow-sm prose prose-purple max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            q.passage || "<i>Văn bản bài đọc đang trống...</i>",
                        }}
                      />
                    ) : (
                      <textarea
                        onBlur={handleBlur}
                        className="w-full p-6 rounded-3xl outline-none font-serif text-lg min-h-[250px] shadow-inner focus:ring-4 ring-purple-100 border border-purple-200 transition-all"
                        placeholder="Dán hoặc nhập văn bản bài đọc tại đây..."
                        value={q.passage}
                        onChange={(e) =>
                          updateQuestion(index, { passage: e.target.value })
                        }
                      />
                    )}

                    <div className="mt-10 space-y-6">
                      {q.subQuestions.map((sub, subIdx) => (
                        <div
                          key={subIdx}
                          className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                              CÂU {getQuestionDisplayNum(index, subIdx)}
                            </span>
                            <button
                              onClick={() => {
                                const newSubs = q.subQuestions.filter(
                                  (_, i) => i !== subIdx,
                                );
                                updateQuestion(index, {
                                  subQuestions: newSubs,
                                });
                              }}
                              className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            >
                              <HiOutlineTrash size={20} />
                            </button>
                          </div>
                          <input
                            onBlur={handleBlur}
                            className="w-full mb-4 p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-purple-100 font-bold text-slate-700 border border-transparent focus:border-purple-200"
                            placeholder="Nhập câu hỏi con..."
                            value={sub.content}
                            onChange={(e) =>
                              updateSubQuestion(index, subIdx, {
                                content: e.target.value,
                              })
                            }
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sub.options.map((o, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-100 focus-within:bg-white focus-within:border-purple-200 transition-all"
                              >
                                <span className="pl-3 font-bold text-purple-300 text-xs">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <input
                                  onBlur={handleBlur}
                                  className="w-full p-2.5 outline-none text-sm"
                                  placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                                  value={o}
                                  onChange={(e) => {
                                    const newO = [...sub.options];
                                    newO[i] = e.target.value;
                                    updateSubQuestion(index, subIdx, {
                                      options: newO,
                                    });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-5">
                            <select
                              className="flex-1 p-3 bg-emerald-50 text-emerald-700 font-black rounded-xl text-xs outline-none border border-emerald-100 cursor-pointer"
                              value={sub.correctAnswer}
                              onChange={(e) =>
                                updateSubQuestion(index, subIdx, {
                                  correctAnswer: e.target.value,
                                })
                              }
                            >
                              <option value="">-- ĐÁP ÁN ĐÚNG --</option>
                              {sub.options.map((o, i) => (
                                <option key={i} value={o}>
                                  {o
                                    ? `${String.fromCharCode(65 + i)}. ${o}`
                                    : `Lựa chọn ${String.fromCharCode(65 + i)}`}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              className="w-20 p-3 bg-slate-100 rounded-xl text-center font-black text-slate-600 border border-transparent focus:border-purple-200"
                              value={sub.points}
                              onChange={(e) =>
                                updateSubQuestion(index, subIdx, {
                                  points: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newSubs = [
                            ...q.subQuestions,
                            {
                              content: "",
                              options: ["", "", "", ""],
                              correctAnswer: "",
                              points: 1,
                            },
                          ];
                          updateQuestion(index, { subQuestions: newSubs });
                        }}
                        className="w-full py-5 border-2 border-dashed border-purple-200 rounded-3xl text-purple-400 font-black hover:bg-white hover:text-purple-600 hover:border-purple-400 transition-all flex items-center justify-center gap-2"
                      >
                        + THÊM CÂU HỎI CON
                      </button>
                    </div>
                  </div>
                )}

                {q.type === "essay" && (
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                    <span className="text-blue-700 font-bold flex items-center gap-3">
                      <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <HiOutlineChatBubbleBottomCenterText size={20} />
                      </div>
                      Chế độ tự luận: Học sinh sẽ nhập văn bản trả lời trực
                      tiếp.
                    </span>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-blue-200">
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        Điểm mặc định:
                      </span>
                      <input
                        type="number"
                        className="w-12 text-center font-black text-blue-600 outline-none"
                        value={q.points}
                        onChange={(e) =>
                          updateQuestion(index, {
                            points: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {questions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
            <HiOutlineBookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">
              Chưa có câu hỏi nào. Hãy chọn một loại câu hỏi ở thanh công cụ
              phía dưới!
            </p>
          </div>
        )}
      </div>

      {/* DOCK BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl px-8 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] flex items-center gap-6 md:gap-10 border border-white/10 transition-all hover:scale-105">
        <button
          onClick={addMultipleChoice}
          className="text-slate-400 flex flex-col items-center gap-1 group hover:text-emerald-400 transition-all"
        >
          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
            <HiOutlineCheckBadge size={28} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Trắc nghiệm
          </span>
        </button>
        <div className="w-px h-10 bg-white/10 hidden md:block"></div>
        <button
          onClick={addEssay}
          className="text-slate-400 flex flex-col items-center gap-1 group hover:text-blue-400 transition-all"
        >
          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
            <HiOutlineChatBubbleBottomCenterText size={28} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Tự luận
          </span>
        </button>
        <div className="w-px h-10 bg-white/10 hidden md:block"></div>
        <button
          onClick={addPassageGroup}
          className="text-slate-400 flex flex-col items-center gap-1 group hover:text-purple-400 transition-all"
        >
          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
            <HiOutlineBookOpen size={28} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Bài đọc
          </span>
        </button>
      </div>
    </div>
  );
};

export default CreateExam;
