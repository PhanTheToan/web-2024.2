import React from "react";
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
import { X } from 'lucide-react';

interface SidebarProps {
  categories: CategoryItem[];
  instructors: InstructorItem[];
  prices: PriceItem[];
  reviews: ReviewItem[];
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
  onToggleCollapse
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

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isCollapsed ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onToggleCollapse}
      ></div>

      <aside 
        className={`w-[300px] md:relative md:block fixed top-0 right-0 z-50 h-full bg-white overflow-y-auto transition-transform duration-300 ease-in-out ${
          isCollapsed ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0 p-6 md:p-6 shadow-lg border-l border-gray-200`}
      >
        <div className="flex justify-between items-center mb-8 md:hidden">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <button 
            onClick={onToggleCollapse}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
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
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
