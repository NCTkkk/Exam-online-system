import React from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

const Pagination = ({ currentPage, maxPage, next, prev, jump }) => {
  if (maxPage <= 1) return null;

  // Logic tính toán dải trang hiển thị (Ellipsis logic)
  const getPaginationRange = () => {
    const totalNumbers = 5;
    const siblingCount = 1;

    if (maxPage <= totalNumbers + 2) {
      return [...Array(maxPage).keys()].map((i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, maxPage);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < maxPage - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = [...Array(leftItemCount).keys()].map((i) => i + 1);
      return [...leftRange, "...", maxPage];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = [...Array(rightItemCount).keys()].map(
        (i) => maxPage - rightItemCount + i + 1,
      );
      return [1, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = [
        ...Array(rightSiblingIndex - leftSiblingIndex + 1).keys(),
      ].map((i) => leftSiblingIndex + i);
      return [1, "...", ...middleRange, "...", maxPage];
    }
  };

  // Hàm xử lý click để chặn nhảy trang
  const handleAction = (e, callback) => {
    e.preventDefault(); // Chặn hành vi nhảy lên đầu trang
    callback();
  };

  const paginationRange = getPaginationRange();

  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-10">
      <button
        onClick={(e) => handleAction(e, prev)}
        disabled={currentPage === 1}
        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
      >
        <HiOutlineChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-2">
        {paginationRange.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 text-slate-400 font-black"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={index}
              onClick={(e) => handleAction(e, () => jump(page))}
              className={`w-11 h-11 rounded-2xl font-black text-sm transition-all duration-300 ${
                currentPage === page
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={(e) => handleAction(e, next)}
        disabled={currentPage === maxPage}
        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
      >
        <HiOutlineChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
