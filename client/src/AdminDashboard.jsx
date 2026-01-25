import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlineSearch,
  HiOutlineFilter,
} from "react-icons/hi";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // all, admin, user, member
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        alert("Lỗi: " + (err.response?.data || "Không có quyền"));
      }
    }
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black border border-red-100 uppercase">
            <HiOutlineShieldCheck size={14} /> Admin
          </span>
        );
      case "user":
        return (
          <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100 uppercase">
            <HiOutlineAcademicCap size={14} /> Giáo viên
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black border border-indigo-100 uppercase">
            <HiOutlineUserGroup size={14} /> Học sinh
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">
              Quản trị <span className="text-indigo-600">Hệ thống</span>
            </h2>
            <p className="text-slate-500 font-medium">
              Tìm kiếm và quản lý quyền truy cập thành viên
            </p>
          </div>
        </div>

        {/* --- THANH CÔNG CỤ: TÌM KIẾM & LỌC --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Ô tìm kiếm */}
          <div className="md:col-span-2 relative group">
            <HiOutlineSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-500 rounded-3xl shadow-sm outline-none transition-all font-bold text-slate-700"
            />
          </div>

          {/* Bộ lọc Role */}
          <div className="relative">
            <HiOutlineFilter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-500 rounded-3xl shadow-sm outline-none appearance-none font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="user">Giáo viên</option>
              <option value="member">Học sinh</option>
            </select>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Thành viên
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Vai trò
                </th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredUsers.map((u, index) => (
                  <motion.tr
                    key={u._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{u.name}</p>
                          <p className="text-xs text-slate-400 italic">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">{getRoleBadge(u.role)}</td>
                    <td className="px-8 py-5 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <HiOutlineTrash size={20} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold italic">
                Không tìm thấy thành viên nào phù hợp...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
