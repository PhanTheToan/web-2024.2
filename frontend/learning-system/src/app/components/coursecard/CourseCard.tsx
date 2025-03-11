import React from "react";
import Icon from "./Icon";
import { CourseData } from "@/app/types";


const timeIcon = `<svg id="I1:210;1:1168;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_2273)"> <path d="M7.99998 1.33331C4.33331 1.33331 1.33331 4.33331 1.33331 7.99998C1.33331 11.6666 4.33331 14.6666 7.99998 14.6666C11.6666 14.6666 14.6666 11.6666 14.6666 7.99998C14.6666 4.33331 11.6666 1.33331 7.99998 1.33331ZM10.8 10.8L7.33331 8.66665V4.66665H8.33331V8.13331L11.3333 9.93331L10.8 10.8Z" fill="#FF782D"></path> </g> <defs> <clipPath id="clip0_2221_2273"> <rect width="16" height="16" fill="white"></rect> </clipPath> </defs> </svg>`;

const levelIcon = `<svg id="I1:210;1:1170;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_2291)"> <path d="M13 -1H17V17H13V-1ZM-1 9H3V17H-1V9ZM6 4H10V17H6V4Z" fill="#FF782D"></path> </g> <defs> <clipPath id="clip0_2221_2291"> <rect width="16" height="16" fill="white"></rect> </clipPath> </defs> </svg>`;

const lessonsIcon = `<svg id="I1:210;1:1171;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_2298)"> <path d="M10.6666 0.666687H2.66665C1.93331 0.666687 1.33331 1.26669 1.33331 2.00002V11.3334H2.66665V2.00002H10.6666V0.666687ZM9.99998 3.33335L14 7.33335V14C14 14.7334 13.4 15.3334 12.6666 15.3334H5.32665C4.59331 15.3334 3.99998 14.7334 3.99998 14L4.00665 4.66669C4.00665 3.93335 4.59998 3.33335 5.33331 3.33335H9.99998ZM9.33331 8.00002H13L9.33331 4.33335V8.00002Z" fill="#FF782D"></path> </g> <defs> <clipPath id="clip0_2221_2298"> <rect width="16" height="16" fill="white"></rect> </clipPath> </defs> </svg>`;

interface CourseCardProps {
  course: CourseData;
  viewMode?: "grid" | "list";
}

const CourseCard: React.FC<CourseCardProps> = ({ course, viewMode = "grid" }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (viewMode === "list" && !isMobile) {
    return (
      <article className="flex overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-[300px]">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
          <span className="font-semibold">{course.author}</span>
          <span>in</span>
          <span className="font-semibold">{course.category}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {course.title}
          </h3>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="flex gap-6 text-sm text-gray-600 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Icon svg={timeIcon} width={16} height={16} />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon svg={levelIcon} width={16} height={16} />
              <span>{course.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon svg={lessonsIcon} width={16} height={16} />
              <span>{course.lessons} Lessons</span>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
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
                  <span className="text-primary-600 font-semibold text-lg">
                    {course.currentPrice}
                  </span>
                </>
              )}
            </div>
            <button className="px-6 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-600 rounded-full hover:bg-primary-50 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 flex-wrap">
          
          <span className="font-semibold">{course.author}</span>
          <span>in</span>
          <span className="font-semibold">{course.category}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {course.title}
        </h3>
        <div className="flex gap-4 text-sm text-gray-600 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Icon svg={timeIcon} width={16} height={16} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon svg={levelIcon} width={16} height={16} />
            <span>{course.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon svg={lessonsIcon} width={16} height={16} />
            <span>{course.lessons} Lessons</span>
          </div>
        </div>
        <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.isFree ? (
              <span className="text-green-600 font-semibold">Free</span>
            ) : (
              <>
                {course.originalPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    {course.originalPrice}
                  </span>
                )}
                <span className="text-primary-600 font-semibold">
                  {course.currentPrice}
                </span>
              </>
            )}
          </div>
          <button className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-600 rounded-full hover:bg-primary-50 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;