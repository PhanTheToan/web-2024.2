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
    teacherId: {
      _id: 'teacher1',
      firstName: 'Google',
      lastName: 'Career Certificates',
      username: 'google',
      password: 'hashedpassword',
      role: 'teacher',
      email: 'google@certificates.com',
      phone: '0123456789',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Other',
      profileImage: 'https://example.com/google-profile.jpg',
      coursesEnrolled: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: ['Prompt Engineering', 'AI Basics'],
    thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/DMFk42PH8L9y9MeQ5xc7I/c55cade640bb097b0e5429b780ff7c98/redesigned-hero-image.png?auto=format%2Ccompress&dpr=2',
    price: 49.99,
    studentsEnrolled: [
      { 
        _id: 'student1', 
        firstName: 'John', 
        lastName: 'Doe', 
        username: 'johndoe', 
        password: 'hashedpassword', 
        role: 'student', 
        email: 'john@example.com',
        phone: '0123456789',
        dateOfBirth: new Date('1995-01-01'),
        gender: 'Male',
        profileImage: 'https://example.com/john-profile.jpg',
        coursesEnrolled: ['1'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        _id: 'student2', 
        firstName: 'Jane', 
        lastName: 'Smith', 
        username: 'janesmith', 
        password: 'hashedpassword', 
        role: 'student', 
        email: 'jane@example.com',
        phone: '0123456789',
        dateOfBirth: new Date('1995-01-01'),
        gender: 'Female',
        profileImage: 'https://example.com/jane-profile.jpg',
        coursesEnrolled: ['1'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    lessons: getLessonsForCourse('1'),
    quizzes: ['quiz1'],
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalDuration: 180, // 45 + 60 + 75 minutes from lessons plus 30 minutes quiz
    registrations: 2,
    isPopular: true,
    isPublished: true
  },
  {
    _id: '2',
    title: 'Introduction to Web Development',
    description: 'Học các kỹ năng cơ bản về phát triển web với HTML, CSS và JavaScript',
    teacherId: {
      _id: 'teacher2',
      firstName: 'Alice',
      lastName: 'Johnson',
      username: 'alicej',
      password: 'hashedpassword',
      role: 'teacher',
      email: 'alice@teach.com',
      phone: '0123456789',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Female',
      profileImage: 'https://example.com/alice-profile.jpg',
      coursesEnrolled: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: ['Web Development', 'Programming'],
    thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7t_b8CO_lPSkjiQa6_giaw40gQAtnHayjsg&s',
    price: 29.99,
    studentsEnrolled: [],
    lessons: getLessonsForCourse('2'),
    quizzes: ['quiz2'],
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalDuration: 40, // lesson timeLimit not specified but estimating 20 minutes + 20 minutes quiz
    registrations: 0,
    isPopular: false,
    isPublished: true
  },
  {
    _id: '3',
    title: 'Data Science Fundamentals',
    description: 'Khám phá các khái niệm cơ bản về khoa học dữ liệu và phân tích dữ liệu',
    teacherId: {
      _id: 'teacher3',
      firstName: 'Bob',
      lastName: 'Smith',
      username: 'bobsmith',
      password: 'hashedpassword',
      role: 'teacher',
      email: 'bob@teach.com',
      phone: '0123456789',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      profileImage: 'https://example.com/bob-profile.jpg',
      coursesEnrolled: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: ['Data Science', 'Analytics'],
    thumbnail: 'https://blogassets.leverageedu.com/blog/wp-content/uploads/2020/05/23151218/BA-Courses.png',
    price: 59.99,
    studentsEnrolled: [
      { 
        _id: 'student3', 
        firstName: 'Mike', 
        lastName: 'Brown', 
        username: 'mikebrown', 
        password: 'hashedpassword', 
        role: 'student', 
        email: 'mike@example.com',
        phone: '0123456789',
        dateOfBirth: new Date('1995-01-01'),
        gender: 'Male',
        profileImage: 'https://example.com/mike-profile.jpg',
        coursesEnrolled: ['3'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    lessons: getLessonsForCourse('3'),
    quizzes: ['quiz3'],
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalDuration: 25, // lesson timeLimit not specified but estimating 0 minutes + 25 minutes quiz
    registrations: 1,
    isPopular: true,
    isPublished: true
  }
];