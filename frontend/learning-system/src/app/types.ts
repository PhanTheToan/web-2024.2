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
    _id: string;
    courseId: string;
    title: string;
    content: string;
    videoUrl: string;
    materials: string[];
    order: number;
    timeLimit?: number; // in minutes, optional
    createdAt: Date;
    description?: string;
  }

  export interface User {
    _id: string;
    username: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: string;
    profileImage: string;
    coursesEnrolled: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    totalDuration: number; // in minutes
    price: number;
    lessons: Lesson[] | string[];
    quizzes: Quiz[] | string[];
    studentsEnrolled: User[] | string[];
    teacherId: User | string;
    categories: string[];
    category?: string | { name: string; _id: string }; // For backward compatibility
    rating: number;
    registrations: number; // Number of registrations
    isPopular?: boolean; // Whether the course is marked as popular
    isPublished?: boolean; // Whether the course is published
    createdAt: Date;
    updatedAt?: Date;
  }

  export interface LessonMaterial {
    name: string;
    type: 'pdf' | 'doc' | 'image' | 'other';
    path: string;
    size?: number;
  }

  export interface Quiz {
    _id: string;
    courseId: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
    createdAt: Date;
  }

  export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
  }

  export interface Category {
    _id: string;
    name: string;
    slug?: string;
  }

  export interface Enrollment {
    _id: string;
    userId: string;
    courseId: string;
    enrolledAt: Date;
    progress: number;
    completed: boolean;
    completedAt?: Date;
    lastAccessedAt?: Date;
  }

  export interface QuizSubmission {
    _id: string;
    quizId: string;
    userId: string;
    answers: Record<number, string>;
    score: number;
    passed: boolean;
    submittedAt: Date;
  }

  export interface Review {
    _id: string;
    userId: string | User;
    courseId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }