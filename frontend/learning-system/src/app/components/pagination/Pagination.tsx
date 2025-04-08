import React from "react";
import Icon from "./Icon";

const prevIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.8417 6.175L11.6667 5L6.66669 10L11.6667 15L12.8417 13.825L9.02502 10L12.8417 6.175Z" fill="black"></path> </svg>`;
const nextIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8.33333 5L7.15833 6.175L10.975 10L7.15833 13.825L8.33333 15L13.3333 10L8.33333 5Z" fill="black"></path> </svg>`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
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

  const renderPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        className={`w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-lg text-black rounded-full border border-gray-200 cursor-pointer hover:bg-slate-100 transition-all duration-200 ${
          currentPage === page ? "bg-slate-500 text-white hover:bg-slate-500" : ""
        }`}
        onClick={() => onPageChange(page)}
        aria-current={currentPage === page ? "page" : undefined}
      >
        {page}
      </button>
    ));
  };

  return (
    <nav className="flex gap-2 sm:gap-3 justify-center mt-6 sm:mt-10 flex-wrap" aria-label="Pagination">
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
    </nav>
  );
};

export default Pagination;