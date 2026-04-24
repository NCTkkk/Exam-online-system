import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./context/AuthContext";
import { Link } from "react-router-dom";

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        // Tận dụng API lấy kết quả bài thi đã có của bạn
        const res = await axios.get(
          "http://localhost:5000/api/submissions/my-results",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setActivities(res.data);
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
      <div className="p-10 text-center font-bold text-slate-500">
        Đang tải nhật ký...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">
          Nhật ký hoạt động 🕒
        </h1>
        <p className="text-slate-500 text-sm">
          Theo dõi hành trình học tập và thi cử của bạn
        </p>
      </div>

      <div className="relative border-l-2 border-indigo-100 ml-4 pl-8 pb-10">
        {activities.length === 0 ? (
          <p className="text-slate-400 italic">
            Chưa có hoạt động nào được ghi lại.
          </p>
        ) : (
          activities.map((item, index) => (
            <div key={item._id} className="mb-10 relative">
              {/* Nút tròn Timeline */}
              <div className="absolute -left-[41px] w-5 h-5 bg-white border-4 border-indigo-500 rounded-full z-10"></div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                    Hoàn thành bài thi
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-lg mb-1">
                  Bạn đã nộp bài thi:{" "}
                  <span className="text-indigo-600">
                    {item.exam?.title || "Đề thi đã bị xóa"}
                  </span>
                </h3>

                <div className="flex gap-4 mt-3">
                  <div className="text-sm">
                    <span className="text-slate-400">Kết quả:</span>{" "}
                    <span className="font-bold text-emerald-600">
                      {item.scoreAuto} điểm
                    </span>
                  </div>
                  <div className="text-sm border-l pl-4">
                    <span className="text-slate-400">Thời gian làm:</span>{" "}
                    <span className="font-bold text-slate-700">
                      {Math.floor(item.timeSpent / 60)} phút
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/review-result/${item._id}`}
                    className="text-xs font-bold text-indigo-500 hover:underline"
                  >
                    Xem chi tiết bài làm →
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Điểm bắt đầu (Dưới cùng) */}
        <div className="absolute -left-[41px] bottom-0 w-5 h-5 bg-slate-200 rounded-full border-4 border-white"></div>
      </div>
    </div>
  );
};

export default ActivityLog;
