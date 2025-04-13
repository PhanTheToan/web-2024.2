import React from "react";
import Icon from "./Icon";
import { CategoryItem } from "@/app/types";

const checkboxIcon = `<svg id="I1:223;1:1240;1:1213" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="category-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_364)"> <path d="M12.6667 3.83333V13.1667H3.33333V3.83333H12.6667ZM12.6667 2.5H3.33333C2.6 2.5 2 3.1 2 3.83333V13.1667C2 13.9 2.6 14.5 3.33333 14.5H12.6667C13.4 14.5 14 13.9 14 13.1667V3.83333C14 3.1 13.4 2.5 12.6667 2.5Z" fill="#555555"></path> </g> <defs> <clipPath id="clip0_2221_364"> <rect width="16" height="16" fill="white" transform="translate(0 0.5)"></rect> </clipPath> </defs> </svg>`;

const checkedIcon = `<svg id="I1:223;1:1242;1:1213" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="category-icon" style="width: 16px; height: 16px"> <g clip-path="url(#clip0_2221_382)"> <path d="M12.6667 2.5H3.33333C2.59333 2.5 2 3.1 2 3.83333V13.1667C2 13.9 2.59333 14.5 3.33333 14.5H12.6667C13.4067 14.5 14 13.9 14 13.1667V3.83333C14 3.1 13.4067 2.5 12.6667 2.5ZM6.66667 11.8333L3.33333 8.5L4.27333 7.56L6.66667 9.94667L11.7267 4.88667L12.6667 5.83333L6.66667 11.8333Z" fill="#555555"></path> </g> <defs> <clipPath id="clip0_2221_382"> <rect width="16" height="16" fill="white" transform="translate(0 0.5)"></rect> </clipPath> </defs> </svg>`;

interface CategoryListProps {
  categories: CategoryItem[];
  onCategorySelect: (categories: string[]) => void;
  selectedCategories?: string[];
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onCategorySelect,
  selectedCategories = [],
}) => {
  const handleCategoryClick = (categoryName: string) => {
    let newSelectedCategories: string[];

    if (selectedCategories.includes(categoryName)) {
      // Remove if already selected
      newSelectedCategories = selectedCategories.filter(cat => cat !== categoryName);
    } else {
      // Add if not selected
      newSelectedCategories = [...selectedCategories, categoryName];
    }

    onCategorySelect(newSelectedCategories);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {categories.map((category, index) => {
        const isSelected = selectedCategories.includes(category.name);
        return (
          <button
            key={index}
            className="flex gap-1 items-center text-lg text-neutral-600 hover:text-neutral-800 transition-colors"
            onClick={() => handleCategoryClick(category.name)}
          >
            <Icon
              svg={isSelected ? checkedIcon : checkboxIcon}
              width={16}
              height={16}
            />
            <span>{category.name}</span>
            <span className="ml-auto">{category.count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryList;