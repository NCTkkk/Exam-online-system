import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Trophy,
  Medal,
  Star,
  Flame,
  GraduationCap,
  ClipboardCheck,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";

import Pagination from "../components/common/Pagination";
import { usePagination } from "../components/common/usePagination";

const rankConfigs = {
  "Sơ Nhập": { color: "from-slate-400 to-slate-500", icon: <Star size={18} /> },
  "Tập Sự": { color: "from-blue-400 to-blue-500", icon: <Star size={18} /> },
  "Thông Thạo": {
    color: "from-cyan-400 to-cyan-500",
    icon: <Star size={18} />,
  },
  "Chiến Binh": {
    color: "from-emerald-400 to-emerald-500",
    icon: <Medal size={18} />,
  },
  "Dũng Sĩ": {
    color: "from-green-500 to-green-600",
    icon: <Medal size={18} />,
  },
  "Đấu Sĩ": {
    color: "from-yellow-500 to-yellow-600",
    icon: <Medal size={18} />,
  },
  "Tinh Anh": {
    color: "from-indigo-500 to-indigo-600",
    icon: <Trophy size={18} />,
  },
  "Cao Thủ": {
    color: "from-purple-500 to-purple-600",
    icon: <Trophy size={18} />,
  },
  "Đại Cao Thủ": {
    color: "from-pink-500 to-pink-600",
    icon: <Trophy size={18} />,
  },
  "Huyền Thoại": {
    color: "from-orange-500 to-red-600",
    icon: <Flame size={18} />,
  },
  "Thần Thoại": {
    color: "from-red-600 to-rose-700",
    icon: <Flame size={18} />,
  },
  "Chiến Thần": {
    color: "from-yellow-400 via-orange-500 to-red-600 animate-pulse",
    icon: <Flame size={20} />,
  },
};

const TrophyRoad = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho các bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "elo",
    direction: "desc",
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://exam-online-system-p6yp.onrender.com/api/users/trophy-road",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setPlayers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu đường đua", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // Logic Lọc và Sắp xếp
  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...players];

    // 1. Lọc theo tên (từ trái qua phải - indexOf === 0 ưu tiên lên đầu)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result
        .filter((p) => p.name?.toLowerCase().includes(term))
        .sort((a, b) => {
          const aIndex = a.name.toLowerCase().indexOf(term);
          const bIndex = b.name.toLowerCase().indexOf(term);
          return aIndex - bIndex; // Ai có từ khóa xuất hiện sớm hơn thì đứng trước
        });
    }

    // 2. Lọc Rank
    if (rankFilter) {
      result = result.filter((p) => (p.rank || "Sơ Nhập") === rankFilter);
    }

    // 3. Sắp xếp (ELO, Số lần thi, Số bài đã làm)
    result.sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });

    return result;
  }, [players, searchTerm, rankFilter, sortConfig]);

  // phân trang
  const itemsPerPage = 4;
  const { next, prev, jump, currentData, currentPage, maxPage } = usePagination(
    filteredAndSortedPlayers,
    itemsPerPage,
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  if (loading)
    return (
      <div className="p-10 text-center font-medium min-h-screen">
        Đang tải...
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-400 rounded-2xl shadow-lg shadow-yellow-200">
            <Trophy className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 italic">
              Ranking Center
            </h1>
            <p className="text-slate-500 text-sm">
              Vinh danh những nỗ lực không ngừng nghỉ
            </p>
          </div>
        </div>

        {/* Toolbar lọc */}
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm tên học sinh..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* lọc rank */}
          <div className="relative group">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-40 shadow-sm appearance-none cursor-pointer"
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
            >
              <option value="">Tất cả Rank</option>
              {Object.keys(rankConfigs).map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Nút Sắp xếp nhanh */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-slate-100">
        {[
          { label: "Điểm ELO", key: "elo" },
          { label: "Đề đã làm", key: "uniqueExamsCompleted" },
          { label: "Lượt đã thi", key: "totalSubmissions" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => handleSort(item.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sortConfig.key === item.key
                ? "bg-indigo-600 text-white shadow-md scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ArrowUpDown size={14} />
            {item.label.toUpperCase()}
            {sortConfig.key === item.key && (
              <span className="ml-1 text-[10px] opacity-70">
                ({sortConfig.direction === "asc" ? "Tăng" : "Giảm"})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow">
        {currentData.length > 0 ? (
          currentData.map((player, index) => {
            const currentRankName = player.rank || "Sơ Nhập";
            const config =
              rankConfigs[currentRankName] || rankConfigs["Sơ Nhập"];
            const rankNumber = (currentPage - 1) * itemsPerPage + index + 1;

            return (
              <div
                key={player._id || index}
                className="relative group bg-white border border-slate-200 rounded-3xl p-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col h-full shadow-sm"
              >
                <div
                  className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-gradient-to-r ${config.color} text-white text-[10px] font-bold flex items-center gap-1 shadow-md z-10 uppercase`}
                >
                  {config.icon} {currentRankName}
                </div>

                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 border-2 border-slate-50 shrink-0 shadow-inner">
                    {rankNumber}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-lg text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {player.name || "Người dùng"}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Học viên
                    </span>
                  </div>
                </div>

                <div
                  className={`bg-gradient-to-br ${config.color} rounded-2xl p-4 text-white mb-4 shadow-inner mt-auto`}
                >
                  <div className="text-[10px] opacity-80 font-bold uppercase tracking-wider">
                    Tích lũy ELO
                  </div>
                  <div className="text-2xl font-black italic">
                    {(player.elo || 0).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-xl p-2 flex items-center gap-2 border border-slate-100">
                    <ClipboardCheck
                      size={14}
                      className="text-indigo-500 shrink-0"
                    />
                    <div className="text-[10px] leading-tight">
                      <div className="font-bold text-slate-700">
                        {player.uniqueExamsCompleted || 0}
                      </div>
                      <div className="text-slate-600 font-medium">
                        Đề đã làm
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 flex items-center gap-2 border border-slate-100">
                    <GraduationCap
                      size={14}
                      className="text-emerald-500 shrink-0"
                    />
                    <div className="text-[10px] leading-tight">
                      <div className="font-bold text-slate-700">
                        {player.totalSubmissions || 0}
                      </div>
                      <div className="text-slate-400 font-medium">
                        Lượt đã thi
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full bg-gradient-to-r ${config.color} transition-all duration-1000 shadow-lg`}
                    style={{
                      width: `${Math.min(((player.elo || 0) / 1000) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              Không tìm thấy kết quả phù hợp
            </div>
          </div>
        )}
      </div>

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

export default TrophyRoad;
