"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { mockCourses } from "@/data/mockCourses";
import { ChevronRight } from "lucide-react";

const BreadcrumbContainer = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  // Tạo breadcrumb items đơn giản hóa
  const createSimplifiedBreadcrumbs = () => {
    const breadcrumbItems = [];
    
    // Trang chủ luôn là item đầu tiên
    breadcrumbItems.push({
      href: "/",
      label: "Trang chủ",
      isCurrent: pathname === "/"
    });
    
    // Nếu có "courses" trong path
    if (pathSegments.includes("courses")) {
      // Thêm route Khóa học
      breadcrumbItems.push({
        href: "/courses",
        label: "Khóa học",
        isCurrent: pathname === "/courses"
      });
      
      // Nếu có ID khóa học
      const courseIndex = pathSegments.indexOf("courses");
      if (courseIndex !== -1 && pathSegments.length > courseIndex + 1) {
        const courseId = pathSegments[courseIndex + 1];
        const course = mockCourses.find(c => c._id === courseId);
        
        if (course) {
          breadcrumbItems.push({
            href: `/courses/${courseId}`,
            label: course.title,
            isCurrent: pathSegments.length === courseIndex + 2
          });
          
          // Nếu là trang bài học
          if (pathSegments.includes("lesson") && pathSegments.length > courseIndex + 3) {
            breadcrumbItems.push({
              href: "#",
              label: "Bài học",
              isCurrent: true
            });
          }
          
          // Nếu là trang kiểm tra
          if (pathSegments.includes("quiz") && pathSegments.length > courseIndex + 3) {
            breadcrumbItems.push({
              href: "#",
              label: "Bài kiểm tra",
              isCurrent: true
            });
          }
        }
      }
    }
    
    return breadcrumbItems;
  };

  const breadcrumbs = createSimplifiedBreadcrumbs();

  return (
    <nav 
      className="flex items-center p-2.5 w-full bg-white h-[40px] border-t-2 border-grey" 
      aria-label="Breadcrumb"
    >
      <ol className="flex gap-2 items-center w-full max-w-[1290px] px-5">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.href + index}>
            {index > 0 && (
              <li aria-hidden="true">
                <ChevronRight 
                  size={16} 
                  className="text-neutral-400"
                />
              </li>
            )}

            <li 
              className={`text-base leading-6 ${
                item.isCurrent ? "text-gray-500" : "text-neutral-600"
              }`}
            >
              {item.isCurrent ? (
                <span className="line-clamp-1">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:underline transition-colors flex items-center gap-1"
                >
                  {index === 0 && (
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
                  )}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbContainer;