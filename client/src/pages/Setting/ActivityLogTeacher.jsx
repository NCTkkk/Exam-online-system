import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  HiOutlineRefresh,
  HiOutlineAcademicCap,
  HiOutlineAdjustments,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../components/common/usePagination";
import Pagination from "../../components/common/Pagination";

const ActivityLogTeacher = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // Khởi tạo hook phân trang (10 cái 1 trang)
  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    filteredLogs,
    10,
  );

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/submissions/teacher/activity-log",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setLogs(res.data);
    } catch (err) {
      console.error("Lỗi fetch log", err);
    } finally {
      setLoading(false);
    }
  };

  // Tách logic lọc để dễ quản lý
  useEffect(() => {
    let result = logs;
    if (filter === "student") {
      result = logs.filter((l) => l.type === "STUDENT_SUBMIT");
    } else if (filter === "system") {
      result = logs.filter((l) => l.type === "TEACHER_ACTION");
    }
    setFilteredLogs(result);
    jump(1); // Reset về trang 1 mỗi khi đổi filter
  }, [filter, logs]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Nhật ký <span className="text-indigo-600">Hệ thống</span>
            </h1>
            <p className="text-slate-500 font-medium italic mt-1">
              Giám sát hoạt động nộp bài và quản lý đề thi thời gian thực
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className={`p-3 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all active:scale-95 ${loading ? "opacity-50" : ""}`}
          >
            <HiOutlineRefresh
              className={`${loading ? "animate-spin" : ""} text-slate-600`}
              size={20}
            />
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit mb-6 gap-1 border border-slate-200">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Tất cả"
            count={logs.length}
          />
          <FilterButton
            active={filter === "student"}
            onClick={() => setFilter("student")}
            label="Học sinh"
            count={logs.filter((l) => l.type === "STUDENT_SUBMIT").length}
          />
          <FilterButton
            active={filter === "system"}
            onClick={() => setFilter("system")}
            label="Hệ thống"
            count={logs.filter((l) => l.type === "TEACHER_ACTION").length}
          />
        </div>

        {/* LOG LIST (Dùng currentData thay cho filteredLogs) */}
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-bold uppercase tracking-widest text-xs">
              Đang đồng bộ...
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {currentData.length > 0 ? (
              currentData.map((log) => (
                <LogCard
                  key={log._id || log.id}
                  log={log}
                  navigate={navigate}
                />
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-bold uppercase text-sm tracking-widest">
                Không có dữ liệu
              </div>
            )}
          </div>
        )}

        {/* PHÂN TRANG */}
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

// --- SUB-COMPONENTS ---
const FilterButton = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${active ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-800"}`}
  >
    {label}
    <span
      className={`text-[10px] px-2 py-0.5 rounded-lg ${active ? "bg-indigo-50" : "bg-slate-200"}`}
    >
      {count}
    </span>
  </button>
);

const LogCard = ({ log, navigate }) => {
  const theme =
    {
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
      slate: "bg-slate-50 text-slate-600 border-slate-100",
    }[log.color] || "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <div
      onClick={() =>
        log.type === "STUDENT_SUBMIT" && navigate(`/grade/${log.id}`)
      }
      className="group bg-white p-4 rounded-[2rem] border border-slate-200 flex items-center justify-between shadow-sm transition-all duration-300 cursor-pointer hover:bg-indigo-50/40 hover:border-indigo-200 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${theme} shadow-inner transition-transform group-hover:scale-105`}
        >
          {log.type === "STUDENT_SUBMIT" ? (
            <HiOutlineAcademicCap />
          ) : (
            <HiOutlineAdjustments />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">
              {log.title}
            </h4>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${theme}`}
            >
              {log.badge}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold italic">
            {log.desc}
          </p>
        </div>
      </div>
      <div className="text-right pl-4 border-l border-slate-100 min-w-[80px]">
        <div className="text-lg font-black text-slate-700 leading-none">
          {new Date(log.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-tighter">
          {new Date(log.time).toLocaleDateString("vi-VN")}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogTeacher;
