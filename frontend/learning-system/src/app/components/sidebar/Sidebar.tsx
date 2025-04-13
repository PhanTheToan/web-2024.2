import React, { useState, useEffect } from "react";
import SidebarSection from "./SidebarSection";
import CategoryList from "./CategoryList";
import { CategoryItem, InstructorItem, PriceItem, ReviewItem, FilterState } from "@/app/types";

interface SidebarProps {
  categories: CategoryItem[];
  instructors: InstructorItem[];
  prices: PriceItem[];
  reviews: ReviewItem[];
  onFiltersChange: (filters: FilterState) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedFilters: FilterState;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  instructors,
  prices,
  reviews,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse,
  selectedFilters,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategorySelect = (selectedCategories: string[]) => {
    onFiltersChange({
      ...selectedFilters,
      categories: selectedCategories,
    });
  };

  const handleInstructorSelect = (selectedInstructors: string[]) => {
    onFiltersChange({
      ...selectedFilters,
      instructors: selectedInstructors,
    });
  };

  const handlePriceSelect = (selectedPrices: string[]) => {
    onFiltersChange({
      ...selectedFilters,
      prices: selectedPrices,
    });
  };

  const handleReviewSelect = (selectedReviews: string[]) => {
    onFiltersChange({
      ...selectedFilters,
      reviews: selectedReviews.map(r => parseInt(r.split(' ')[0])),
    });
  };

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <aside
      className={`w-[300px] bg-white p-6 rounded-lg shadow-md transition-all duration-300 ${
        isCollapsed ? "w-0 p-0 overflow-hidden" : ""
      }`}
    >
      <SidebarSection title="Categories">
        <CategoryList
          categories={categories}
          onCategorySelect={handleCategorySelect}
          selectedCategories={selectedFilters.categories}
        />
      </SidebarSection>

      <SidebarSection title="Instructors">
        <CategoryList
          categories={instructors.map(instructor => ({
            name: instructor.name,
            count: instructor.count,
            isActive: false
          }))}
          onCategorySelect={handleInstructorSelect}
          selectedCategories={selectedFilters.instructors}
        />
      </SidebarSection>

      <SidebarSection title="Price">
        <CategoryList
          categories={prices.map(price => ({
            name: price.name,
            count: price.count,
            isActive: false
          }))}
          onCategorySelect={handlePriceSelect}
          selectedCategories={selectedFilters.prices}
        />
      </SidebarSection>

      <SidebarSection title="Rating">
        <CategoryList
          categories={reviews.map(review => ({
            name: `${review.stars} stars`,
            count: review.count,
            isActive: false
          }))}
          onCategorySelect={handleReviewSelect}
          selectedCategories={selectedFilters.reviews.map(r => `${r} stars`)}
        />
      </SidebarSection>
    </aside>
  );
};

export default Sidebar;
