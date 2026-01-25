import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiPlus,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckBadge,
} from "react-icons/hi2";

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyExams = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/exams/my-exams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(res.data);
    };
    fetchMyExams();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa đề thi này? Hành động này không thể hoàn tác!",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/exams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(exams.filter((e) => e._id !== id));
      } catch (err) {
        alert("Lỗi: " + (err.response?.data || "Không thể xóa"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Kho <span className="text-indigo-600">Đề thi</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Quản lý, chỉnh sửa và theo dõi kết quả bài thi của bạn
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create-exam")}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <HiPlus size={20} strokeWidth={3} />
            TẠO ĐỀ MỚI
          </motion.button>
        </div>

        {/* GRID LIST */}
        <div className="grid grid-cols-1 gap-6">
          {exams.length > 0 ? (
            exams.map((examItem, index) => (
              <motion.div
                key={examItem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <HiOutlineDocumentText size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                      {examItem.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest ml-1">
                    <div className="flex items-center gap-1.5">
                      <HiOutlineClock size={16} />
                      {examItem.duration} PHÚT
                    </div>
                    <div className="flex items-center gap-1.5 border-l pl-4">
                      <HiOutlineCalendar size={16} />
                      {new Date(examItem.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/exam-submissions/${examItem._id}`)
                    }
                    className="mt-5 flex items-center gap-2 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-black transition-all"
                  >
                    <HiOutlineChartBar size={18} />
                    DANH SÁCH NỘP BÀI & XUẤT EXCEL
                  </button>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-none">
                  <button
                    onClick={() => navigate(`/submissions/${examItem._id}`)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                  >
                    <HiOutlineCheckBadge size={20} />
                    CHẤM BÀI
                  </button>

                  <button
                    onClick={() => navigate(`/edit-exam/${examItem._id}`)}
                    className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    <HiOutlinePencilSquare size={20} />
                    SỬA
                  </button>

                  <button
                    onClick={() => handleDelete(examItem._id)}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-500 px-5 py-3 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all"
                  >
                    <HiOutlineTrash size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black text-xl">
                Bạn chưa có đề thi nào.
              </p>
              <button
                onClick={() => navigate("/create-exam")}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Tạo đề đầu tiên ngay!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageExams;
