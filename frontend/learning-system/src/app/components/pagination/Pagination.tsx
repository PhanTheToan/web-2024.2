import React from "react";
import Icon from "./Icon";

const prevIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.8417 6.175L11.6667 5L6.66669 10L11.6667 15L12.8417 13.825L9.02502 10L12.8417 6.175Z" fill="black"></path> </svg>`;
const nextIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8.33333 5L7.15833 6.175L10.975 10L7.15833 13.825L8.33333 15L13.3333 10L8.33333 5Z" fill="black"></path> </svg>`;
const firstIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11.6667 5L10.4917 6.175L14.3083 10L10.4917 13.825L11.6667 15L16.6667 10L11.6667 5Z" fill="black"></path> <path d="M5 5L3.825 6.175L7.64167 10L3.825 13.825L5 15L10 10L5 5Z" fill="black"></path> </svg>`;
const lastIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8.33333 5L7.15833 6.175L10.975 10L7.15833 13.825L8.33333 15L13.3333 10L8.33333 5Z" fill="black"></path> <path d="M14.1667 5L12.9917 6.175L16.8083 10L12.9917 13.825L14.1667 15L19.1667 10L14.1667 5Z" fill="black"></path> </svg>`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handleFirstClick = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastClick = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };

  const renderPageNumbers = () => {
    const maxPagesToShow = 7; // Hiển thị tối đa 7 số trang
    const pages: (number | string)[] = [];
    const sidePages = Math.floor(maxPagesToShow / 2); // 3 trang mỗi bên

    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả trang nếu tổng số trang nhỏ
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - sidePages);
      let endPage = Math.min(totalPages, currentPage + sidePages);

      // Điều chỉnh để luôn hiển thị 7 trang (hoặc gần 7)
      if (currentPage <= sidePages + 1) {
        endPage = maxPagesToShow;
      }
      if (currentPage >= totalPages - sidePages) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      // Thêm các số trang
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Thêm dấu chấm lửng nếu cần
      if (startPage > 1) {
        pages.unshift("...");
      }
      if (endPage < totalPages) {
        pages.push("...");
      }
    }

    return pages.map((page, index) => (
      <button
        key={index}
        className={`w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-lg rounded-full border border-gray-200 cursor-pointer hover:bg-slate-100 transition-all duration-200 ${
          page === currentPage
            ? "bg-slate-500 text-white hover:bg-slate-500"
            : page === "..." ? "cursor-default hover:bg-transparent" : ""
        }`}
        onClick={() => typeof page === "number" && onPageChange(page)}
        disabled={page === "..."}
        aria-current={page === currentPage ? "page" : undefined}
      >
        {page}
      </button>
    ));
  };

  return (
    <nav className="flex gap-2 sm:gap-3 justify-center mt-6 sm:mt-10 flex-wrap" aria-label="Pagination">
      <button
        className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-lg text-black rounded-full border border-gray-200 cursor-pointer hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleFirstClick}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        <Icon svg={firstIcon} width={20} height={20} />
      </button>

      <button
        className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-lg text-black rounded-full border border-gray-200 cursor-pointer hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePrevClick}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <Icon svg={prevIcon} width={20} height={20} />
      </button>

      <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">{renderPageNumbers()}</div>

      <button
        className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-lg text-black rounded-full border border-gray-200 cursor-pointer hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <Icon svg={nextIcon} width={20} height={20} />
      </button>

      <button
        className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-lg text-black rounded-full border border-gray-200 cursor-pointer hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleLastClick}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        <Icon svg={lastIcon} width={20} height={20} />
      </button>
    </nav>
  );
};

export default Pagination;