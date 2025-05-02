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
    content?: string;
    videoUrl?: string;
    materials?: string[] | LessonMaterial[];
    order?: number;
    timeLimit?: number; // in minutes, optional
    createdAt?: Date;
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
    id?: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    categories: string[];
    createdAt: string | Date;
    updatedAt?: string | Date;
    teacherId: string | User;
    lessons: Lesson[] | string[];
    quizzes: Quiz[] | string[];
    studentsEnrolled: User[] | string[];
    isPublished?: boolean;
    isPopular?: boolean;
    totalDuration?: number;
    registrations?: number;
    duration: string | number;
    rating: number;
    
    // Add new properties from API responses
    teacherFullName?: string;
    teacherName?: string;
    courseStatus?: string;
    totalTimeLimit?: number;
    studentsCount?: number;
    contentCount?: number;
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
    order?: number;
    status?: QuizStatus;
    createdAt: Date;
  }

  export interface QuizQuestion {
    question: string;
    material?: string | null;
    equestion: EQuestion;
    options: string[];
    correctAnswer: string[];
  }

  export enum EQuestion {
    SINGLE_CHOICE = 'SINGLE_CHOICE',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    SHORT_ANSWER = 'SHORT_ANSWER'
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

  export enum QuizStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
  }