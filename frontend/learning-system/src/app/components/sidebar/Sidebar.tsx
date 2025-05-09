import React from "react";
import Select, { MultiValue } from "react-select";
import { StarIcon } from "@heroicons/react/24/solid"; // Icon ngôi sao
import { XMarkIcon } from "@heroicons/react/24/outline"; // Icon đóng sidebar

interface CategoryItem {
  id: string;
  name: string; // categoryName, ví dụ: "DEVELOPMENT"
  displayName: string; // categoryDisplayName, ví dụ: "Lập Trình"
  count: number; // Số lượng khóa học
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
  reviews: string[]; // Lưu mảng các range được chọn (ví dụ: ["4 -> 5", "3 -> 4"])
}

interface SidebarProps {
  categories: CategoryItem[];
  instructors: InstructorItem[];
  reviews: ReviewItem[];
  onFiltersChange: (newFilters: FilterState) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedFilters: FilterState;
}

// Define the select option type
interface SelectOption {
  value: string;
  label: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  instructors,
  reviews,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse,
  selectedFilters,
}) => {
  const handleCategoryToggle = (categoryName: string) => {
    const newCategories = selectedFilters.categories.includes(categoryName)
      ? selectedFilters.categories.filter((name) => name !== categoryName)
      : [...selectedFilters.categories, categoryName];
    onFiltersChange({ ...selectedFilters, categories: newCategories });
  };

  const handleInstructorChange = (selected: MultiValue<SelectOption>) => {
    const newInstructors = selected.map((option) => option.value);
    onFiltersChange({ ...selectedFilters, instructors: newInstructors });
  };

  const handleReviewToggle = (range: string) => {
    const newReviews = selectedFilters.reviews.includes(range)
      ? selectedFilters.reviews.filter((r) => r !== range)
      : [...selectedFilters.reviews, range];
    onFiltersChange({ ...selectedFilters, reviews: newReviews });
  };

  return (
    <div className={`${isCollapsed ? "hidden" : "block"} md:block fixed md:relative inset-0 z-40 bg-black bg-opacity-50 md:bg-transparent`}>
      <aside className={`w-64 h-full md:h-auto overflow-y-auto transition-all duration-300 bg-white p-4 shadow-md absolute md:relative right-0 md:right-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
          <button
            onClick={onToggleCollapse}
            className="md:hidden text-gray-600 hover:text-gray-800 p-1"
            aria-label="Đóng sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Danh mục</h3>
          <ul>
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between mb-2"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters.categories.includes(category.name)}
                    onChange={() => handleCategoryToggle(category.name)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{category.displayName}</span>
                </div>
                <span className="text-gray-500 text-sm">{category.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Giảng viên</h3>
          <Select<SelectOption, true>
            isMulti
            options={instructors.map((instructor) => ({
              value: instructor.id, // Lưu User.id
              label: instructor.name, // Hiển thị fullName
            }))}
            onChange={handleInstructorChange}
            value={selectedFilters.instructors.map((id) => ({
              value: id,
              label: instructors.find((i) => i.id === id)?.name || id,
            }))}
            placeholder="Chọn giảng viên..."
            className="basic-multi-select"
            classNamePrefix="select"
            styles={{
              control: (provided) => ({
                ...provided,
                borderColor: "#e2e8f0",
                padding: "2px",
                borderRadius: "6px",
              }),
              option: (provided) => ({
                ...provided,
                color: "#374151",
              }),
            }}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Đánh giá</h3>
          <ul>
            {reviews.map((review) => (
              <li key={review.range} className="flex items-center mb-3">
                <label className="flex items-center cursor-pointer w-full hover:bg-gray-100 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedFilters.reviews.includes(review.range)}
                    onChange={() => handleReviewToggle(review.range)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="flex items-center text-gray-700 text-sm">
                    {review.range} <StarIcon className="h-4 w-4 text-yellow-400 ml-1" />
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;