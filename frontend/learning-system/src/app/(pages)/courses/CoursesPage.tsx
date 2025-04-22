"use client";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import React, { useState, useEffect } from "react";
import CourseListingHeader from "@/app/components/courelistingheader/CourseListingHeader";
import CourseCard from "@/app/components/coursecard/CourseCard";
import Pagination from "@/app/components/pagination/Pagination";
import Sidebar from "@/app/components/sidebar/Sidebar";
import { toast } from "react-hot-toast";
import { Course as CourseType } from "@/app/types";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082/api";

// Định nghĩa các interface
interface Category {
  categoryId: string;
  categoryName: string;
  categoryDisplayName: string | null;
  categoryCount: number;
}

interface Instructor {
  id: string;
  fullName: string;
}

interface CourseApiResponse {
  id: string;
  title: string;
  teacherFullName: string;
  teacherId: string | null;
  thumbnail: string;
  courseStatus: string;
  price: number;
  studentsCount: number;
  contentCount: number;
  totalTimeLimit: number;
  categories: string[];
}

interface CategoryItem {
  id: string;
  name: string;
  displayName: string;
  count: number;
  url: string;
  isActive: boolean;
}

interface InstructorItem {
  id: string;
  name: string; // fullName của giảng viên
  isActive: boolean;
}

interface ReviewItem {
  range: string; // Ví dụ: "4 -> 5"
  min: number; // Điểm tối thiểu
  max: number; // Điểm tối đa
}

interface FilterState {
  categories: string[]; // Lưu categoryName
  instructors: string[]; // Lưu User.id của giảng viên (ObjectId)
  reviews: string; // Lưu range được chọn (ví dụ: "4 -> 5")
}

const CoursesPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(9);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [instructors, setInstructors] = useState<InstructorItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    instructors: [],
    reviews: "",
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Mock data cho reviews
  const reviews: ReviewItem[] = [
    { range: "4 -> 5", min: 4, max: 5 },
    { range: "3 -> 4", min: 3, max: 4 },
    { range: "2 -> 3", min: 2, max: 3 },
    { range: "1 -> 2", min: 1, max: 2 },
    { range: "0 -> 1", min: 0, max: 1 },
  ];

  // Fetch categories và instructors
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/featured-category`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        const formattedCategories: CategoryItem[] = data.body
          ? data.body.map((cat: Category) => ({
              id: cat.categoryId || "",
              name: cat.categoryName || "",
              displayName: cat.categoryDisplayName || (cat.categoryName === "POPULAR" ? "Phổ biến" : cat.categoryName) || "",
              count: cat.categoryCount || 0,
              url: "",
              isActive: false,
            }))
          : [];

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Không thể tải danh mục khóa học");
      }
    };

    const fetchInstructors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/course/teacher`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch instructors");
        }
        const data = await response.json();
        const formattedInstructors: InstructorItem[] = data.body.map((ins: Instructor) => ({
          id: ins.id || "",
          name: ins.fullName || "",
          isActive: false,
        }));
        setInstructors(formattedInstructors);
      } catch (error) {
        console.error("Failed to fetch instructors:", error);
      }
    };

    fetchCategories();
    fetchInstructors();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          size: pageSize.toString(),
        });

        if (filters.categories.length > 0) {
          params.set("category", filters.categories.join(","));
        }
        if (filters.instructors.length > 0) {
          params.set("teacherIds", filters.instructors.join(","));
        }
        if (filters.reviews) {
          const selectedReview = reviews.find((r) => r.range === filters.reviews);
          if (selectedReview) {
            params.set("ratingMin", selectedReview.min.toString());
            params.set("ratingMax", selectedReview.max.toString());
          }
        }

        const endpoint = searchQuery
          ? `${API_BASE_URL}/course/search?query=${encodeURIComponent(searchQuery)}&${params.toString()}`
          : `${API_BASE_URL}/course?${params.toString()}`;

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        const formattedCourses: CourseType[] = data.content.map((course: CourseApiResponse) => ({
          _id: course.id,
          id: course.id,
          title: course.title,
          teacherFullName: course.teacherFullName,
          teacherId: course.teacherId,
          thumbnail: course.thumbnail,
          courseStatus: course.courseStatus,
          price: course.price,
          studentsCount: course.studentsCount,
          contentCount: course.contentCount,
          totalTimeLimit: course.totalTimeLimit,
          categories: course.categories,
          description: "",  // Required by CourseType 
          createdAt: "",    // Required by CourseType
          lessons: [],      // Required by CourseType
          quizzes: [],      // Required by CourseType
          studentsEnrolled: [] // Required by CourseType
        }));

        setCourses(formattedCourses);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Không thể tải khóa học. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, filters, searchQuery]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // API dùng index từ 0
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Ánh xạ categoryName sang displayName
  const getCategoryDisplayNames = (categoryNames: string[]): string[] => {
    return categoryNames.map((name) => {
      const category = categories.find((cat) => cat.name === name);
      return category ? category.displayName : name;
    });
  };

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
                    viewMode === "grid" || isMobile
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id || course._id}
                      course={{
                        ...course,
                        categories: getCategoryDisplayNames(course.categories),
                      }}
                      variant={viewMode}
                    />
                  ))}
                </div>

                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage + 1} // Hiển thị trang từ 1
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