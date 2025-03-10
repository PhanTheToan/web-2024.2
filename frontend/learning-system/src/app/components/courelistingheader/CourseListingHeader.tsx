import React from "react";
import Icon from "./Icon";
import { useState } from "react";

const searchIcon = `<svg id="1:205" layer-name="Icon" width="20" height="20" viewBox="0 0 20 20" fill="grey" xmlns="http://www.w3.org/2000/svg" class="search-icon" style="width: 20px; height: 20px"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.16663 3.33335C5.94496 3.33335 3.33329 5.94503 3.33329 9.16669C3.33329 12.3883 5.94496 15 9.16663 15C12.3883 15 15 12.3883 15 9.16669C15 5.94503 12.3883 3.33335 9.16663 3.33335ZM1.66663 9.16669C1.66663 5.02455 5.02449 1.66669 9.16663 1.66669C13.3088 1.66669 16.6666 5.02455 16.6666 9.16669C16.6666 13.3088 13.3088 16.6667 9.16663 16.6667C5.02449 16.6667 1.66663 13.3088 1.66663 9.16669Z" fill="black"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2858 13.2858C13.6113 12.9603 14.1389 12.9603 14.4643 13.2858L18.0893 16.9108C18.4148 17.2362 18.4148 17.7638 18.0893 18.0893C17.7639 18.4147 17.2363 18.4147 16.9108 18.0893L13.2858 14.4643C12.9604 14.1388 12.9604 13.6112 13.2858 13.2858Z" fill="grey"></path> </svg>`;
const gridIcon = `<svg id="1:206" layer-name="Icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="grid-icon" style="width: 20px; height: 20px"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 2.5V9.16667H9.16667V2.5H2.5ZM2.5 10.8333V17.5H9.16667V10.8333H2.5ZM10.8333 2.5V9.16667H17.5V2.5H10.8333ZM10.8333 10.8333V17.5H17.5V10.8333H10.8333Z" fill="grey"></path> </svg>`;
const listIcon = `<svg id="1:207" layer-name="Icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="list-icon" style="width: 20px; height: 20px; color: grey"> <g clip-path="url(#clip0_1_207)"> <path d="M2.29163 11.0417H4.58329V8.75002H2.29163V11.0417ZM2.29163 15H4.58329V12.7084H2.29163V15ZM2.29163 7.08335H4.58329V4.79169H2.29163V7.08335ZM6.24996 11.0417H17.7083V8.75002H6.24996V11.0417ZM6.24996 15H17.7083V12.7084H6.24996V15ZM6.24996 4.79169V7.08335H17.7083V4.79169H6.24996Z" fill="#000"></path> </g> <defs> <clipPath id="clip0_1_207"> <rect width="20" height="20" fill="white"></rect> </clipPath> </defs> </svg>`;
const dropdownIcon = `<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>`;
const filterIcon=`<svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1595 295q17 41-14 70l-493 493v742q0 42-39 59-13 5-25 5-27 0-45-19l-256-256q-19-19-19-45V858L211 365q-31-29-14-70 17-39 59-39h1280q42 0 59 39z" fill="#878787" class="fill-000000"></path></svg>`
const filterOptions = [
  "Newly published",
  "Title a-z",
  "Title z-a",
  "Price high to low",
  "Price low to high",
  "Popular",
  "Average Ratings",
];

interface CourseListingHeaderProps {
  onViewChange: (view: "grid" | "list") => void;
  toggleSidebar: () => void; // Bắt buộc prop toggleSidebar
  initialViewMode?: "grid" | "list";
  isMobile?: boolean;
}

const CourseListingHeader: React.FC<CourseListingHeaderProps> = ({
  onViewChange,
  toggleSidebar,
  initialViewMode = "grid",
  isMobile = false

}) => {
  const [filter, setFilter] = useState("Newly published");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);

  // Update local state when initialViewMode changes
  React.useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  const handleViewChange = (view: "grid" | "list") => {
    setViewMode(view);
    onViewChange(view);
  };

  return (
    <div className="mb-6">
      <h2 className="text-4xl font-bold text-gray-900 mb-4 max-sm:text-2xl">
        All Courses
      </h2>

      <div className="flex justify-between items-center max-sm:flex-col max-sm:gap-4">
        <div className="relative flex items-center w-[300px] max-sm:w-full border border-gray-300 rounded-full overflow-hidden px-4 py-2">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full text-gray-500 text-sm outline-none bg-transparent"
          />
          <button aria-label="Search courses">
            <Icon
              svg={searchIcon}
              width={18}
              height={18}
              className="text-gray-600"
            />
          </button>
        </div>

        <div className="flex gap-6 items-center max-sm:w-full justify-evenly">
          <div className="relative">
            <button
              className="px-4 py-2 text-gray-600 text-sm flex items-center gap-2 border border-grey-300 rounded-full hover:bg-gray-100"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              {filter}{" "}
              <Icon
                svg={dropdownIcon}
                width={12}
                height={12}
                className="text-gray-600"
              />
            </button>
            {isDropdownOpen && (
              <ul className="z-50 absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                {filterOptions.map((option) => (
                  <li
                    key={option}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilter(option);
                      setDropdownOpen(false);
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
            {!isMobile &&(
          <div className="hidden sm:flex border border-gray-300 rounded-full overflow-hidden">
            <button
              onClick={() => handleViewChange("grid")}
              aria-label="Grid view"
              className={`px-3 py-2 border-r border-gray-300 hover:bg-gray-100 ${
                viewMode === "grid" ? "bg-gray-300" : ""
              }`}
            >
              <Icon
                svg={gridIcon}
                width={20}
                height={20}
                className="text-gray-500"
              />
            </button>
            <button
              onClick={() => handleViewChange("list")}
              aria-label="List view"
              className={`px-3 py-2 hover:bg-gray-100 ${
                viewMode === "list" ? "bg-gray-300" : ""
              }`}
            >
              <Icon
                svg={listIcon}
                width={20}
                height={20}
                className="text-gray-500"
              />
            </button>
          </div>
            )}
          {/* Button toggle sidebar chỉ hiển thị trên mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 text-white border-2 border-grey-300 rounded-full mb-2 hover:bg-gray-200"
          >
            <Icon svg={filterIcon} width={20} height={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseListingHeader;
