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
  CourseData,
  CategoryItem,
  InstructorItem,
  PriceItem,
  ReviewItem,
  FilterState,
} from "@/app/types";

const EduPressCourseListing: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Mock data for breadcrumb
  // const breadcrumbItems: BreadcrumbItem[] = [
  //   { label: "Homepage", url: "#" },
  //   { label: "Course", url: "#" },
  //   {
  //     label: "The Ultimate Guide To The BestWordPress LMS Plugin",
  //     isCurrent: true,
  //   },
  // ];

  // Mock data for courses
  const courses: CourseData[] = [
    {
      id: "1",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/fda21530622fe38291ec0a2264501ea0e551e50a",
      category: "Photography",
      author: "Determined-Poitras",
      title: "Create an LMS Website with LearnPress",
      duration: "2Weeks",
      students: 156,
      level: "All levels",
      lessons: 20,
      originalPrice: "$29.0",
      currentPrice: "$19.0",
      isFree: true,
      description: "",
    },
    {
      id: "2",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/822e08a85e97d69368fc5fcff168768da4190aa8",
      category: "Photography",
      author: "Determined-Poitras",
      title: "Create an LMS Website with LearnPress",
      duration: "2Weeks",
      students: 156,
      level: "All levels",
      lessons: 20,
      originalPrice: "$29.0",
      currentPrice: "$19.0",
      isFree: true,
      description: "",
    },
    {
      id: "3",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/75e9a6d3527f8358017a1b97d39266a7b07ff0af",
      category: "Photography",
      author: "Determined-Poitras",
      title: "Create an LMS Website with LearnPress",
      duration: "2Weeks",
      students: 156,
      level: "All levels",
      lessons: 20,
      originalPrice: "$29.0",
      currentPrice: "$19.0",
      isFree: true,
      description: "",
    },
    {
      id: "4",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/8c4cabfdb4bf421c057f3950a06ff3ea087e2efe",
      category: "Photography",
      author: "Determined-Poitras",
      title: "Create an LMS Website with LearnPress",
      duration: "2Weeks",
      students: 156,
      level: "All levels",
      lessons: 20,
      originalPrice: "$29.0",
      currentPrice: "$19.0",
      isFree: false,
      description: "",
    },
    {
      id: "5",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3cd1ae15aa658b019b48ecd36cdc50e49bd20aed",
      category: "Photography",
      author: "Determined-Poitras",
      title: "Create an LMS Website with LearnPress",
      duration: "2Weeks",
      students: 156,
      level: "All levels",
      lessons: 20,
      originalPrice: "$29.0",
      currentPrice: "$19.0",
      isFree: true,
      description: "",
    },
    {
      id: "6",
      thumbnail:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/118e455f3dc8876acb9744895f84ef1a1fb26c08",
      category: "Photography",
      author: "Determined-Poitras",
      title: "Create an LMS Website with LearnPress",
      duration: "2Weeks",
      students: 156,
      level: "All levels",
      lessons: 20,
      originalPrice: "$29.0",
      currentPrice: "$19.0",
      isFree: false,
      description: "",
    },
  ];

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
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCourses = courses.slice(
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
              <CourseListingHeader onViewChange={setViewMode} toggleSidebar={toggleSidebar} />
            </div>

            <div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {displayedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? "bg-primary-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="w-full md:w-80">
            <Sidebar
              categories={categories}
              instructors={instructors}
              prices={prices}
              reviews={reviews}
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
              isCollapsed={isSidebarCollapsed} // Truyền trạng thái
              toggleSidebar={toggleSidebar} // Truyền hàm toggle
            />
          </aside>
        </div>
      </main>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(courses.length / itemsPerPage)}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default EduPressCourseListing;

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
