import { Course, Lesson } from '@/app/types';
import { mockLessons } from './mockData';

// Get the appropriate lessons for each course from mockLessons
const getLessonsForCourse = (courseId: string): Lesson[] => {
  return mockLessons.filter(lesson => lesson.courseId === courseId);
};

export const mockCourses: Course[] = [
  {
    _id: '1',
    title: 'Google Prompting Essentials',
    description: 'Nhận thức cơ bản về một chủ đề mới, kỹ năng nghề nghiệp cao cấp',
    teacherId: 'teacher1',
    categories: ['Prompt Engineering', 'AI Basics'],
    thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/DMFk42PH8L9y9MeQ5xc7I/c55cade640bb097b0e5429b780ff7c98/redesigned-hero-image.png?auto=format%2Ccompress&dpr=2',
    price: 49.99,
    studentsEnrolled: ['student1', 'student2'],
    lessons: getLessonsForCourse('1'),
    quizzes: ['quiz1', 'quiz4'],
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalDuration: 210, // Adjusted to match lessons and quizzes
    registrations: 2,
    isPopular: true,
    isPublished: true,
    duration: 210 // Total duration in minutes
  },
  {
    _id: '2',
    title: 'Introduction to Web Development',
    description: 'Học các kỹ năng cơ bản về phát triển web với HTML, CSS và JavaScript',
    teacherId: 'teacher2',
    categories: ['Web Development', 'Programming'],
    thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7t_b8CO_lPSkjiQa6_giaw40gQAtnHayjsg&s',
    price: 29.99,
    studentsEnrolled: [],
    lessons: getLessonsForCourse('2'),
    quizzes: ['quiz2'],
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalDuration: 40,
    registrations: 0,
    isPopular: false,
    isPublished: true,
    duration: 40 // Total duration in minutes
  },
  {
    _id: '3',
    title: 'Data Science Fundamentals',
    description: 'Khám phá các khái niệm cơ bản về khoa học dữ liệu và phân tích dữ liệu',
    teacherId: 'teacher3',
    categories: ['Data Science', 'Analytics'],
    thumbnail: 'https://blogassets.leverageedu.com/blog/wp-content/uploads/2020/05/23151218/BA-Courses.png',
    price: 59.99,
    studentsEnrolled: ['student3'],
    lessons: getLessonsForCourse('3'),
    quizzes: ['quiz3'],
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalDuration: 25,
    registrations: 1,
    isPopular: true,
    isPublished: true,
    duration: 25 // Total duration in minutes
  }
];