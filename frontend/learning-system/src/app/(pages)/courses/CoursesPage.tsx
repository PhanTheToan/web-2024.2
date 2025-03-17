"use client";
// import type { Metadata } from "next";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import React, { useState } from "react";
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
import { mockCourses } from "@/data/mockCourses";

const CoursesPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Mock data for breadcrumb
  // const breadcrumbItems: BreadcrumbItem[] = [
  //   { label: "Homepage", url: "#" },
  //   { label: "Course", url: "#" },
  //   {
  //     label: "The Ultimate Guide To The BestWordPress LMS Plugin",
  //     isCurrent: true,
  //   },
  // ];

  // Mock data for sidebar
  const categories: CategoryItem[] = [
    { name: "Commercial", count: 15, isActive: false },
    { name: "Office", count: 15, isActive: false },
    { name: "Shop", count: 15, isActive: true },
    { name: "Educate", count: 15, isActive: false },
    { name: "Academy", count: 15, isActive: true },
    { name: "Single family home", count: 15, isActive: false },
    { name: "Studio", count: 15, isActive: false },
    { name: "University", count: 15, isActive: false },
  ];

  const instructors: InstructorItem[] = [
    { name: "Kenny White", count: 15, isActive: false },
    { name: "John Doe", count: 15, isActive: false },
  ];

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

  // Handler functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real app, you would fetch courses for the new page here
  };

  // const handleCategorySelect = (category: string) => {
  //   console.log(`Selected category: ${category}`);
  //   // In a real app, you would filter courses by category here
  // };

  // const handleInstructorSelect = (instructor: string) => {
  //   console.log(`Selected instructor: ${instructor}`);
  //   // In a real app, you would filter courses by instructor here
  // };

  // const handlePriceSelect = (price: string) => {
  //   console.log(`Selected price: ${price}`);
  //   // In a real app, you would filter courses by price here
  // };

  // const handleReviewSelect = (stars: number) => {
  //   console.log(`Selected review: ${stars} stars`);
  //   // In a real app, you would filter courses by review rating here
  // };

  const itemsPerPage = 9;
  const totalPages = Math.ceil(mockCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCourses = mockCourses.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    instructors: [],
    prices: [],
    reviews: [],
  });

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log("Filters changed:", newFilters);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
              <CourseListingHeader isMobile={isMobile} onViewChange={setViewMode} toggleSidebar={toggleSidebar} initialViewMode={viewMode} />
            </div>

            <div
              className={`grid gap-6 ${(viewMode === "grid"|| isMobile) ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {displayedCourses.map((course) => (
                <CourseCard key={course._id} course={course} variant={viewMode} />
              ))}
            </div>

            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

          <Sidebar
            categories={categories}
            instructors={instructors}
            prices={prices}
            reviews={reviews}
            onFiltersChange={handleFiltersChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
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
