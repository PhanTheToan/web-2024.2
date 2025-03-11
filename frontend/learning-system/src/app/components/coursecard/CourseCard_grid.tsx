"use client";

import React from "react";
import Icon from "./Icon";
import { CourseData } from "./types";

const timeIcon = `<svg id=\"I1:210;1:1168;1:1213\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"meta-icon\" style=\"width: 16px; height: 16px\"> <g clip-path=\"url(#clip0_2221_2273)\"> <path d=\"M7.99998 1.33331C4.33331 1.33331 1.33331 4.33331 1.33331 7.99998C1.33331 11.6666 4.33331 14.6666 7.99998 14.6666C11.6666 14.6666 14.6666 11.6666 14.6666 7.99998C14.6666 4.33331 11.6666 1.33331 7.99998 1.33331ZM10.8 10.8L7.33331 8.66665V4.66665H8.33331V8.13331L11.3333 9.93331L10.8 10.8Z\" fill=\"#FF782D\"></path> </g> <defs> <clipPath id=\"clip0_2221_2273\"> <rect width=\"16\" height=\"16\" fill=\"white\"></rect> </clipPath> </defs> </svg>`;

const lessonsIcon = `<svg id=\"I1:210;1:1171;1:1213\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"meta-icon\" style=\"width: 16px; height: 16px\"> <g clip-path=\"url(#clip0_2221_2298)\"> <path d=\"M10.6666 0.666687H2.66665C1.93331 0.666687 1.33331 1.26669 1.33331 2.00002V11.3334H2.66665V2.00002H10.6666V0.666687ZM9.99998 3.33335L14 7.33335V14C14 14.7334 13.4 15.3334 12.6666 15.3334H5.32665C4.59331 15.3334 3.99998 14.7334 3.99998 14L4.00665 4.66669C4.00665 3.93335 4.59998 3.33335 5.33331 3.33335H9.99998ZM9.33331 8.00002H13L9.33331 4.33335V8.00002Z\" fill=\"#FF782D\"></path> </g> <defs> <clipPath id=\"clip0_2221_2298\"> <rect width=\"16\" height=\"16\" fill=\"white\"></rect> </clipPath> </defs> </svg>`;

const CourseCard_grid: React.FC<{ course: CourseData }> = ({ course }) => {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 shadow-md flex flex-col w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-square">
        <img
          src={course.thumbnail}
          alt="Course thumbnail"
          className="object-contain w-full h-full rounded-t-3xl"
        />
      </div>
      <div className="flex flex-col flex-1 p-5 bg-white">
        <h3 className="text-xl font-semibold text-black">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          by <span className="font-medium text-black">{course.author}</span> in {course.category}
        </p>
        <div className="flex gap-4 flex-wrap text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Icon svg={lessonsIcon} width={16} height={16} />
            <span>{course.lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon svg={timeIcon} width={16} height={16} />
            <span>{course.students} Students</span>
          </div>
        </div>
        <div className="flex flex-col items-center mt-4 border-t pt-4 border-gray-200 text-center">
          <span className={`text-lg font-semibold ${course.isFree ? "text-green-600" : "text-red-600"}`}>
            {course.isFree ? "Free" : `${course.currentPrice}`}
          </span>
          <button className="mt-3 px-5 py-2 text-sm font-medium text-black border border-gray-300 rounded-full hover:bg-gray-100">
            Read More
          </button>
        </div>
      </div>
    </article>
  );
};

export default CourseCard_grid;