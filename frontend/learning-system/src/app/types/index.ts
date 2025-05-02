export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: 'USER' | 'TEACHER';
  email: string;
  coursesEnrolled: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  title: string;
  description: string;
}
export interface Course {
  _id?: string;
  id?: string;
  title: string;
  teacherFullName?: string;
  teacherId?: string | { firstName?: string; lastName?: string };
  teacherName?: string;
  thumbnail?: string | null;
  courseStatus?: string;
  price: number;
  studentsCount?: number;
  contentCount?: number;
  totalTimeLimit?: number;
  totalDuration?: number;
  categories: string[];
  description?: string;
  createdAt?: string;
  lessons?: [];
  quizzes?: [];
  studentsEnrolled?: [];
}