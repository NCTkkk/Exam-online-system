import { useState, useMemo } from "react";

export const usePagination = (data, itemsPerPage = 5) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán dữ liệu cho trang hiện tại
  const currentData = useMemo(() => {
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return data.slice(begin, end);
  }, [data, currentPage, itemsPerPage]);

  // Tổng số trang (tối thiểu là 1)
  const maxPage = Math.ceil(data.length / itemsPerPage) || 1;

  const next = () => setCurrentPage((page) => Math.min(page + 1, maxPage));
  const prev = () => setCurrentPage((page) => Math.max(page - 1, 1));
  const jump = (page) => {
    const pageNumber = Math.max(1, Number(page));
    setCurrentPage(Math.min(pageNumber, maxPage));
  };

  return { next, prev, jump, currentData, currentPage, maxPage };
};
