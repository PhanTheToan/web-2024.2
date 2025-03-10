

export interface CourseData {
    id: string;
    thumbnail: string;
    category: string;
    author: string;
    title: string;
    duration: string;
    students: number;
    level: string;
    lessons: number;
    originalPrice: string;
    currentPrice: string;
    isFree?: boolean;
    description: string;
  }
  
  export interface CategoryItem {
    name: string;
    count: number;
    isActive?: boolean;
  }
  
  export interface InstructorItem {
    name: string;
    count: number;
    isActive?: boolean;
  }
  
  export interface PriceItem {
    name: string;
    count: number;
    isActive?: boolean;
  }
  
  export interface ReviewItem {
    stars: number;
    count: number;
    isActive?: boolean;
  }
  
  export interface BreadcrumbItem {
    label: string;
    url?: string;
    isCurrent?: boolean;
  }
  