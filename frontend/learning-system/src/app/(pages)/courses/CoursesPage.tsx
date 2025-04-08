"use client";
// import type { Metadata } from "next";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import React, { useState, useEffect } from "react";
import CourseListingHeader from "@/app/components/courelistingheader/CourseListingHeader";
import CourseCard from "@/app/components/coursecard/CourseCard";
import Pagination from "@/app/components/pagination/Pagination";
import Sidebar from "@/app/components/sidebar/Sidebar";
// import CourseCard_grid from "@/app/components/coursecard/CourseCard_grid";
import {
  Course,
  CategoryItem,
  InstructorItem,
  PriceItem,
  ReviewItem,
  FilterState,
} from "@/app/types";
import { courseService } from "@/services/courseService";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 9;

const CoursesPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [instructors, setInstructors] = useState<InstructorItem[]>([]);
  const [sortBy, setSortBy] = useState<string>("Newly published");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    instructors: [],
    prices: [],
    reviews: [],
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch categories and instructors
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, instructorsData] = await Promise.all([
          courseService.getCategories(),
          courseService.getInstructors(),
        ]);
        setCategories(categoriesData);
        setInstructors(instructorsData);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        toast.error('Không thể tải dữ liệu ban đầu');
      }
    };

    fetchInitialData();
  }, []);

  // Fetch courses with filters, sorting, and search
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await courseService.getCourses(
          currentPage,
          ITEMS_PER_PAGE,
          filters,
          sortBy,
          searchQuery
        );
        setCourses(response.courses);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError('Không thể tải danh sách khóa học');
        toast.error('Không thể tải danh sách khóa học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, filters, sortBy, searchQuery]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Mock data for prices and reviews (these should come from API in the future)
  const prices: PriceItem[] = [
    { name: "All", count: 15, isActive: true },
    { name: "Free", count: 15, isActive: false },
    { name: "Paid", count: 15, isActive: false },
  ];

  const reviews: ReviewItem[] = [
    { stars: 5, count: 1025, isActive: false },
    { stars: 4, count: 1025, isActive: true },
    { stars: 1, count: 1025, isActive: false },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* <link
        href="https://fonts.googleapis.com/css2?family=Exo:wght@400;600;700&family=Jost:wght@400;500&display=swap"
        rel="stylesheet"
      /> */}

      {/* <Header /> */}

      {/* <Breadcrumb items={breadcrumbItems} /> */}
      <BreadcrumbContainer />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-6">
              <CourseListingHeader
                isMobile={isMobile}
                onViewChange={setViewMode}
                toggleSidebar={toggleSidebar}
                initialViewMode={viewMode}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onSearch={setSearchQuery}
              />
            </div>

            {isLoading ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 rounded-lg h-[400px]"
                  />
                ))}
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    (viewMode === "grid" || isMobile)
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {courses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      variant={viewMode}
                    />
                  ))}
                </div>

                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>

          <Sidebar
            categories={categories}
            instructors={instructors}
            prices={prices}
            reviews={reviews}
            onFiltersChange={handleFiltersChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            selectedFilters={filters}
          />
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;

// export default function CoursePage() {
//   return (
//    <div className = "w-full">
//       <BreadcrumbContainer />
//       {/* Breadcrumb */}

//       <h2>thanh</h2>
//       {/* Tiêu đề trang */}
//       <h1 className="text-[38px] font-[700] mt-4">Trang danh sách khóa học</h1>

//       {/* Nội dung khác của trang danh sách khóa học */}

//       <main className="flex gap-8 px-4 py-16 mx-auto my-0 max-w-[1552px] max-md:flex-col">
//         <section className="flex-1">
//           <CourseListingHeader />

//           <div className="flex flex-col gap-8">
//             {courses.map((course) => (
//               <CourseCard key={course.id} course={course} />
//             ))}
//           </div>

//           <Pagination
//             currentPage={currentPage}
//             totalPages={3}
//             onPageChange={handlePageChange}
//           />
//         </section>

//         {/* <Sidebar
//           categories={categories}
//           instructors={instructors}
//           prices={prices}
//           reviews={reviews}
//           onCategorySelect={handleCategorySelect}
//           onInstructorSelect={handleInstructorSelect}
//           onPriceSelect={handlePriceSelect}
//           onReviewSelect={handleReviewSelect}
//         /> */}
//       </main>
//    </div>

//   );
// }

// export const metadata: Metadata = {
//   title: "Trang danh sách khóa học",
//   description: "Trang danh sách khóa học"
// };
