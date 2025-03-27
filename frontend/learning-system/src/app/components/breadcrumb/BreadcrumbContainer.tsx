"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { mockCourses } from "@/data/mockCourses";
import { ChevronRight } from "lucide-react";
import { Course } from "@/app/types";

// Định nghĩa các route đặc biệt và cách hiển thị
const SPECIAL_ROUTES: Record<string, string> = {
  courses: "Khóa học",
  profile: "Hồ sơ",
  settings: "Cài đặt",
  dashboard: "Bảng điều khiển",
};

// Định nghĩa các route cần xử lý đặc biệt (có ID)
const DYNAMIC_ROUTES = {
  courses: {
    getData: (id: string): Course | undefined => mockCourses.find(c => c._id === id),
    getTitle: (data: Course): string => data.title,
  },
  // Có thể thêm các route khác ở đây
} as const;

const formatSegment = (segment: string): string => {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const BreadcrumbContainer = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  // Xử lý route động (có ID)
  const getDynamicRouteData = (segment: string, index: number) => {
    const prevSegment = pathSegments[index - 1];
    const dynamicRoute = DYNAMIC_ROUTES[prevSegment as keyof typeof DYNAMIC_ROUTES];
    
    if (dynamicRoute) {
      const data = dynamicRoute.getData(segment);
      return data ? dynamicRoute.getTitle(data) : null;
    }
    return null;
  };

  // Xử lý hiển thị segment
  const getSegmentDisplay = (segment: string, index: number): string => {
    // Kiểm tra route đặc biệt
    if (SPECIAL_ROUTES[segment]) {
      return SPECIAL_ROUTES[segment];
    }

    // Kiểm tra route động
    const dynamicTitle = getDynamicRouteData(segment, index);
    if (dynamicTitle) {
      return dynamicTitle;
    }

    // Mặc định format segment
    return formatSegment(segment);
  };

  return (
    <nav 
      className="flex items-center p-2.5 w-full bg-white h-[40px] border-t-2 border-grey" 
      aria-label="Breadcrumb"
    >
      <ol className="flex gap-2 items-center w-full max-w-[1290px] px-5">
        {/* Home link */}
        <li className="text-base leading-6 text-neutral-600">
          <Link 
            href="/" 
            className="hover:underline flex items-center gap-1"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-neutral-600"
            >
              <path 
                d="M8 2L2 7.33333V14H6V10H10V14H14V7.33333L8 2Z" 
                fill="currentColor"
              />
            </svg>
            <span>Trang chủ</span>
          </Link>
        </li>

        {/* Path segments */}
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;
          const displayText = getSegmentDisplay(segment, index);

          return (
            <React.Fragment key={href}>
              <li aria-hidden="true">
                <ChevronRight 
                  size={16} 
                  className="text-neutral-400"
                />
              </li>

              <li 
                className={`text-base leading-6 ${
                  isLast ? "text-gray-500" : "text-neutral-600"
                }`}
              >
                {isLast ? (
                  <span className="line-clamp-1">{displayText}</span>
                ) : (
                  <Link
                    href={href}
                    className="hover:underline transition-colors"
                  >
                    {displayText}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbContainer;