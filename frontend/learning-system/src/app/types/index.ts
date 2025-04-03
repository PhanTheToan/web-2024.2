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
  _id: string;
  title: string;
  description: string;
  teacherId: User;
  categories: string[];
  thumbnail: string;
  price: number;
  studentsEnrolled: User[];
  lessons: Lesson[];
  quizzes: string[];
  rating: number;
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
} 