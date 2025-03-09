import React from "react";
import Icon from "./Icon";
import { CourseData } from "@/app/types";

// Icons (giữ nguyên từ code của bạn)
const timeIcon = `<svg id="I1:210;1:1168;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_2273)"> <path d="M7.99998 1.33331C4.33331 1.33331 1.33331 4.33331 1.33331 7.99998C1.33331 11.6666 4.33331 14.6666 7.99998 14.6666C11.6666 14.6666 14.6666 11.6666 14.6666 7.99998C14.6666 4.33331 11.6666 1.33331 7.99998 1.33331ZM10.8 10.8L7.33331 8.66665V4.66665H8.33331V8.13331L11.3333 9.93331L10.8 10.8Z" fill="#FF782D"></path> </g> <defs> <clipPath id="clip0_2221_2273"> <rect width="16" height="16" fill="white"></rect> </clipPath> </defs> </svg>`;
const levelIcon = `<svg id="I1:210;1:1170;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_2291)"> <path d="M13 -1H17V17H13V-1ZM-1 9H3V17H-1V9ZM6 4H10V17H6V4Z" fill="#FF782D"></path> </g> <defs> <clipPath id="clip0_2221_2291"> <rect width="16" height="16" fill="white"></rect> </clipPath> </defs> </svg>`;
const lessonsIcon = `<svg id="I1:210;1:1171;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_2298)"> <path d="M10.6666 0.666687H2.66665C1.93331 0.666687 1.33331 1.26669 1.33331 2.00002V11.3334H2.66665V2.00002H10.6666V0.666687ZM9.99998 3.33335L14 7.33335V14C14 14.7334 13.4 15.3334 12.6666 15.3334H5.32665C4.59331 15.3334 3.99998 14.7334 3.99998 14L4.00665 4.66669C4.00665 3.93335 4.59998 3.33335 5.33331 3.33335H9.99998ZM9.33331 8.00002H13L9.33331 4.33335V8.00002Z" fill="#FF782D"></path> </g> <defs> <clipPath id="clip0_2221_2298"> <rect width="16" height="16" fill="white"></rect> </clipPath> </defs> </svg>`;
const quizIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M8 1.33331C4.3181 1.33331 1.33337 4.31804 1.33337 7.99998C1.33337 11.6819 4.3181 14.6666 8 14.6666C11.6819 14.6666 14.6666 11.6819 14.6666 7.99998C14.6666 4.31804 11.6819 1.33331 8 1.33331ZM9.33337 10.6666H6.66671V9.33331H9.33337V10.6666ZM9.33337 8.66665H6.66671V4.66665H9.33337V8.66665Z" fill="#FF782D"/></g><defs><clipPath id="clip0"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`;
const studentIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M8 2.66669C6.15905 2.66669 4.66671 4.15902 4.66671 6.00002C4.66671 7.84102 6.15905 9.33335 8 9.33335C9.841 9.33335 11.3334 7.84102 11.3334 6.00002C11.3334 4.15902 9.841 2.66669 8 2.66669ZM8 7.99998C6.89547 7.99998 6.00002 7.10454 6.00002 6.00002C6.00002 4.89549 6.89547 4.00002 8 4.00002C9.10454 4.00002 10 4.89549 10 6.00002C10 7.10454 9.10454 7.99998 8 7.99998ZM15.3334 13.3334C15.3334 10.6819 12.6485 8.66665 9.33337 8.66665C6.01824 8.66665 3.33337 10.6819 3.33337 13.3334V14.6667H15.3334V13.3334Z" fill="#FF782D"/></g><defs><clipPath id="clip0"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`;

interface CourseCardProps {
  course: CourseData;
  viewMode?: "grid" | "list";
}

const CourseCard: React.FC<CourseCardProps> = ({ course, viewMode = "grid" }) => {
  // Dạng List (giống hình ảnh trên mobile)
  if (viewMode === "list") {
    return (
      <article className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-4">
        {/* Hình ảnh thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="object-cover w-full h-full rounded-t-lg"
          />
        </div>
        {/* Nội dung khóa học */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <div className="text-sm text-gray-600 mb-2">by {course.author}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Icon svg={lessonsIcon} width={16} height={16} className="text-orange-500" />
              <span>{course.lessons} Lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon svg={studentIcon} width={16} height={16} className="text-orange-500" />
              <span>{course.students} Students</span>
            </div>
          </div>
          {/* Giá và nút Read More */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {course.isFree ? (
                <span className="text-green-600 font-semibold text-lg">Free</span>
              ) : (
                <>
                  {course.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      {course.originalPrice}
                    </span>
                  )}
                  <span className="text-orange-500 font-semibold text-lg">
                    {course.currentPrice}
                  </span>
                </>
              )}
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-500 rounded-full hover:bg-gray-100 transition-colors">
              Read More
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Dạng Grid (giữ nguyên nhưng tối ưu cho responsive)
  return (
    <article className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="object-cover w-full h-full rounded-t-lg"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <div className="text-sm text-gray-600 mb-2">by {course.author}</div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
          <div className="flex items-center gap-1">
            <Icon svg={lessonsIcon} width={16} height={16} className="text-orange-500" />
            <span>{course.lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon svg={studentIcon} width={16} height={16} className="text-orange-500" />
            <span>{course.students} Students</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.isFree ? (
              <span className="text-green-600 font-semibold text-lg">Free</span>
            ) : (
              <>
                {course.originalPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    {course.originalPrice}
                  </span>
                )}
                <span className="text-orange-500 font-semibold text-lg">
                  {course.currentPrice}
                </span>
              </>
            )}
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            Read More
          </button>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;