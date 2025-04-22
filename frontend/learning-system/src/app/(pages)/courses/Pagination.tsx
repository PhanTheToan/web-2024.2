import React from "react";

interface PaginationProps {
  currentPage: number; // Trang hiện tại (bắt đầu từ 1 trong UI)
  totalPages: number; // Tổng số trang
  onPageChange: (page: number) => void; // Callback khi đổi trang
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Hàm tạo danh sách các số trang
  const getPageNumbers = () => {
    const maxPagesToShow = 5; // Số lượng nút số trang tối đa
    const pages: (number | string)[] = [];
    const sidePages = Math.floor(maxPagesToShow / 2); // Số trang hiển thị mỗi bên

    if (totalPages <= maxPagesToShow) {
      // Nếu tổng số trang nhỏ, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Trang đầu
      pages.push(1);

      // Tính toán phạm vi trang lân cận
      let startPage = Math.max(2, currentPage - sidePages);
      let endPage = Math.min(totalPages - 1, currentPage + sidePages);

      // Điều chỉnh để đảm bảo hiển thị đủ số trang
      if (currentPage <= sidePages + 1) {
        endPage = maxPagesToShow - 1;
      }
      if (currentPage >= totalPages - sidePages) {
        startPage = totalPages - maxPagesToShow + 2;
      }

      // Thêm dấu chấm lửng nếu cần
      if (startPage > 2) {
        pages.push("...");
      }

      // Thêm các trang lân cận
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Thêm dấu chấm lửng và trang cuối nếu cần
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      if (endPage < totalPages) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center space-x-2">
      {/* Nút Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-primary-600 text-white hover:bg-primary-700"
        }`}
      >
        Previous
      </button>

      {/* Các số trang */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? "bg-primary-600 text-white"
              : page === "..."
              ? "bg-transparent text-gray-500 cursor-default"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Nút Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-primary-600 text-white hover:bg-primary-700"
        }`}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;