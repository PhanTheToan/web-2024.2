import React, { useState } from "react";
import SidebarSection from "./SidebarSection";
import CategoryList from "./CategoryList";
import InstructorList from "./InstructorList";
import PriceList from "./PriceList";
import ReviewList from "./ReviewList";
import {
  CategoryItem,
  InstructorItem,
  PriceItem,
  ReviewItem,
  FilterState,
} from "@/app/types";

interface SidebarProps {
  categories: CategoryItem[];
  instructors: InstructorItem[];
  prices: PriceItem[];
  reviews: ReviewItem[];
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  isCollapsed: boolean; // Nhận trạng thái từ parent
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  instructors,
  prices,
  reviews,
  onFiltersChange,
  initialFilters = {
    categories: [],
    instructors: [],
    prices: [],
    reviews: [],
    
  },
  isCollapsed,
  toggleSidebar
}) => {
  const [filters, setFilters] = React.useState<FilterState>(initialFilters);

  const handleCategorySelect = (selectedCategories: string[]) => {
    const newFilters = { ...filters, categories: selectedCategories };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleInstructorSelect = (selectedInstructors: string[]) => {
    const newFilters = { ...filters, instructors: selectedInstructors };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceSelect = (selectedPrices: string[]) => {
    const newFilters = { ...filters, prices: selectedPrices };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReviewSelect = (selectedReviews: number[]) => {
    const newFilters = { ...filters, reviews: selectedReviews };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // const [isCollapsed, setIsCollapsed] = useState(false);

  // const toggleSidebar = () => {
  //   setIsCollapsed(!isCollapsed);
  // };

  return (
    <>
      {/* Mobile toggle button - Always visible on mobile */}
      

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 bg-white bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isCollapsed ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
      ></div>

<aside 
        className={`w-[270px] md:relative md:block fixed top-0 left-0 z-40 h-full bg-white overflow-y-auto transition-transform duration-300 ease-in-out ${
          isCollapsed ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 p-4 md:p-0`}
      >
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-xl font-bold">Filters</h2>
          <button 
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        
          <SidebarSection title="Course category">
            <CategoryList
              categories={categories}
              onCategorySelect={handleCategorySelect}
              selectedCategories={filters.categories}
            />
          </SidebarSection>

          <SidebarSection title="Instructors">
            <InstructorList
              instructors={instructors}
              onInstructorSelect={handleInstructorSelect}
              selectedInstructors={filters.instructors}
            />
          </SidebarSection>

          <SidebarSection title="Price">
            <PriceList
              prices={prices}
              onPriceSelect={handlePriceSelect}
              selectedPrices={filters.prices}
            />
          </SidebarSection>

          <SidebarSection title="Review">
            <ReviewList
              reviews={reviews}
              onReviewSelect={handleReviewSelect}
              selectedReviews={filters.reviews}
            />
          </SidebarSection>
       
      </aside>
    </>
  );
};

export default Sidebar;
