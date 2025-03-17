// Common types for the EduPress course listing

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
    isActive: boolean;
  }
  
  export interface InstructorItem {
    name: string;
    count: number;
    isActive: boolean;
  }
  
  export interface PriceItem {
    name: string;
    count: number;
    isActive: boolean;
  }
  
  export interface ReviewItem {
    stars: number;
    count: number;
    isActive: boolean;
  }
  
  export interface FilterState {
    categories: string[];
    instructors: string[];
    prices: string[];
    reviews: number[];
  }
  
  export interface Lesson {
    title: string;
    description: string;
  }

  export interface User {
    _id: string;
    username: string;
    password: string;
    role: 'ADMIN' | 'TEACHER' | 'USER';
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: 'Male' | 'Female' | 'Other';
    profileImage?: string;
    coursesEnrolled: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Course {
    _id: string;
    title: string;
    description: string;
    teacherId: User;
    categories: string[];
    thumbnail?: string;
    price: number;
    studentsEnrolled: User[];
    lessons: Lesson[];
    quizzes: string[];
    duration: string;
    rating: number;
    requirements: string[];
    createdAt: Date;
    updatedAt: Date;
  }