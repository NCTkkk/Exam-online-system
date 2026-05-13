import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { usePagination } from "../../components/common/usePagination";
import Pagination from "../../components/common/Pagination";

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Khởi tạo phân trang (5 bài thi mỗi trang)
  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    activities,
    5,
  );

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/submissions/my-results",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // Sắp xếp dữ liệu mới nhất lên đầu trước khi set vào state
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setActivities(sorted);
      } catch (err) {
        console.error("Lỗi khi tải nhật ký:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">
          Đang tải hành trình của bạn...
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
          Nhật ký <span className="text-indigo-600">Hoạt động</span> 🕒
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Chào <span className="font-bold text-slate-700">{user?.name}</span>,
          theo dõi lại quá trình thi cử của bạn tại đây.
        </p>
      </div>

      <div className="relative border-l-2 border-indigo-100 ml-4 pl-8">
        {currentData.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold italic">
              Chưa có hoạt động nào.
            </p>
          </div>
        ) : (
          currentData.map((item) => (
            <div key={item._id} className="mb-10 relative group">
              {/* Nút tròn Timeline */}
              <div className="absolute -left-[41px] w-5 h-5 bg-white border-4 border-indigo-500 rounded-full z-10 group-hover:scale-125 transition-transform"></div>
              {/* thẻ div chứa nội dung chính của mỗi hoạt động */}
              <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    Hoàn thành bài thi
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                <h3 className="font-black text-slate-800 text-lg mb-3 tracking-tight">
                  Bạn đã nộp bài:{" "}
                  <span className="text-indigo-600">
                    {item.exam?.title || "Đề thi đã xóa"}
                  </span>
                </h3>

                <div className="flex gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Kết quả
                    </p>
                    <p className="font-black text-2xl text-emerald-600">
                      {item.scoreAuto}đ
                    </p>
                  </div>
                  <div className="w-[1px] bg-slate-200"></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Thời gian
                    </p>
                    <p className="font-black text-2xl text-slate-700">
                      {Math.floor(item.timeSpent / 60)}ph
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                  <Link
                    to={`/review-result/${item._id}`}
                    className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Điểm kết thúc Timeline */}
        {currentData.length > 0 && (
          <div className="absolute -left-[41px] bottom-0 w-5 h-5 bg-slate-200 rounded-full border-4 border-white"></div>
        )}
      </div>

      {/* HIỂN THỊ PHÂN TRANG */}
      <Pagination
        currentPage={currentPage}
        maxPage={maxPage}
        next={next}
        prev={prev}
        jump={jump}
      />
    </div>
  );
};

export default ActivityLog;
