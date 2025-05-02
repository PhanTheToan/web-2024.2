"use client";

import React from "react";
import Icon from "../icon/Icon";
import { Course } from "@/app/types";

interface CourseCardGridProps {
  course: Course;
}

const CourseCardGrid: React.FC<CourseCardGridProps> = ({ course }) => {
  const firstCategory = course.categories[0];

  const lessonsIcon = `<svg id="I1:210;1:1171;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_1_210)"> <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14Z" fill="#9D9D9D"/> <path d="M8 4C6.9 4 6 4.9 6 6V8C6 8.55 6.45 9 7 9H9V11H7C6.45 11 6 11.45 6 12C6 12.55 6.45 13 7 13H9C9.55 13 10 12.55 10 12V9C10 8.45 9.55 8 9 8H7V6C7 5.45 7.45 5 8 5C8.55 5 9 5.45 9 6C9 6.55 9.45 7 10 7C10.55 7 11 6.55 11 6C11 4.9 10.1 4 9 4H8Z" fill="#9D9D9D"/> </g> <defs> <clipPath id="clip0_1_210"> <rect width="16" height="16" fill="white"/> </clipPath> </defs> </svg>`;

  const timeIcon = `<svg id="I1:210;1:1168;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_2273)"> <path d="M7.99998 1.33331C4.33331 1.33331 1.33331 4.33331 1.33331 7.99998C1.33331 11.6666 4.33331 14.6666 7.99998 14.6666C11.6666 14.6666 14.6666 11.6666 14.6666 7.99998C14.6666 4.33331 11.6666 1.33331 7.99998 1.33331ZM10.8 10.8L7.33331 8.66665V4.66665H8.33331V8.13331L11.3333 9.93331L10.8 10.8Z" fill="#FF782D"></path> </g> <defs> <clipPath id="clip0_2221_2273"> <rect width="16" height="16" fill="white"></rect> </clipPath> </defs> </svg>`;

  const studentsIcon = `<svg id="I1:210;1:1170;1:1213" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="meta-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_1_210)"> <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14Z" fill="#9D9D9D"/> <path d="M8 4C6.9 4 6 4.9 6 6V8C6 8.55 6.45 9 7 9H9V11H7C6.45 11 6 11.45 6 12C6 12.55 6.45 13 7 13H9C9.55 13 10 12.55 10 12V9C10 8.45 9.55 8 9 8H7V6C7 5.45 7.45 5 8 5C8.55 5 9 5.45 9 6C9 6.55 9.45 7 10 7C10.55 7 11 6.55 11 6C11 4.9 10.1 4 9 4H8Z" fill="#9D9D9D"/> </g> <defs> <clipPath id="clip0_1_210"> <rect width="16" height="16" fill="white"/> </clipPath> </defs> </svg>`;

  return (
    <article className="flex flex-col overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full h-full">
      <div className="w-full h-[200px] bg-gray-100 border-b border-gray-200 flex items-center justify-center overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          className="w-full min-w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 h-[24px] overflow-hidden">
          <span className="font-medium text-primary-600 truncate max-w-[100px]">
            {firstCategory}
          </span>
          <span className="flex-shrink-0">•</span>
          <span className="truncate">
            {typeof course.teacherId === "object" ? (
              <>
                {course.teacherId.firstName} {course.teacherId.lastName}
              </>
            ) : (
              course.teacherId
            )}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 h-[3.2rem] flex items-start">
          {course.title}
        </h3>
        <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
          <div className="flex flex-col items-center justify-center py-3 px-2 bg-gray-50 rounded-lg h-[80px]">
            <Icon svg={timeIcon} width={20} height={20} className="mb-1.5" />
            <span className="text-center line-clamp-1">{course.duration}</span>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-2 bg-gray-50 rounded-lg h-[80px]">
            <Icon svg={lessonsIcon} width={20} height={20} className="mb-1.5" />
            <span className="text-center line-clamp-1">
              {course.lessons.length} Lessons
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-2 bg-gray-50 rounded-lg h-[80px]">
            <Icon
              svg={studentsIcon}
              width={20}
              height={20}
              className="mb-1.5"
            />
            <span className="text-center line-clamp-1">
              {course.studentsEnrolled.length} Students
            </span>
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
          <div>
            {course.price === 0 ? (
              <span className="text-green-600 font-semibold text-lg">Free</span>
            ) : (
              <span className="text-primary-600 font-semibold text-lg">
                ${course.price}
          </span>
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

export default CourseCardGrid;
