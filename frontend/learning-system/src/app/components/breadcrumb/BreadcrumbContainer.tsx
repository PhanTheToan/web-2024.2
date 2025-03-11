"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";


const formatSegment = (segment: string) => {
  return segment
    .replace(/-/g, " ") // Thay dấu "-" bằng khoảng trắng
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Viết hoa chữ cái đầu mỗi từ
};

const BreadcrumbContainer = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center p-2.5 w-full bg-neutral-100 h-[60px]" aria-label="Breadcrumb">
      <ol className="flex gap-2 items-center w-full max-w-[1290px] px-5">
        <li className="text-base leading-6 text-neutral-600">
          <Link href="/" className="hover:underline">Homepage</Link>
        </li>

        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;
          // const isCourse = segment.toLowerCase() === "courses"; // Kiểm tra nếu là "courses"

          return (
            <React.Fragment key={href}>
              <li aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.66665 4L5.72665 4.94L8.77999 8L5.72665 11.06L6.66665 12L10.6667 8L6.66665 4Z" fill="#9D9D9D"/>
                </svg>
              </li>

              <li className={`text-base leading-6 ${isLast ? "text-gray-500" : "text-neutral-600"}`}>
                {isLast ? (
                  formatSegment(segment)
                ) : (
                  <Link
                    href={href}
                    className={`capitalize hover:underline }`} 
                  >
                    {formatSegment(segment)}
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