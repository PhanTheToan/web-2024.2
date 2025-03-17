import { Course } from '@/app/types';

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
      role: 'TEACHER',
      email: 'google@certificates.com',
      coursesEnrolled: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: ['Prompt Engineering', 'AI Basics'],
    thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/DMFk42PH8L9y9MeQ5xc7I/c55cade640bb097b0e5429b780ff7c98/redesigned-hero-image.png?auto=format%2Ccompress&dpr=2',
    price: 49.99,
    studentsEnrolled: [
      { _id: 'student1', firstName: 'John', lastName: 'Doe', username: 'johndoe', password: 'hashedpassword', role: 'USER', email: 'john@example.com', coursesEnrolled: [], createdAt: new Date(), updatedAt: new Date() },
      { _id: 'student2', firstName: 'Jane', lastName: 'Smith', username: 'janesmith', password: 'hashedpassword', role: 'USER', email: 'jane@example.com', coursesEnrolled: [], createdAt: new Date(), updatedAt: new Date() },
    ],
    lessons: [
      { title: 'Giới thiệu về Prompt Engineering', description: 'Tìm hiểu cơ bản về prompt engineering và tầm quan trọng của nó' },
      { title: 'Các kỹ thuật Prompt cơ bản', description: 'Học các kỹ thuật cơ bản để tạo prompt hiệu quả' },
      { title: 'Prompt nâng cao', description: 'Khám phá các kỹ thuật prompt nâng cao và best practices' },
      { title: 'Thực hành và dự án', description: 'Áp dụng kiến thức vào các dự án thực tế' }
    ],
    quizzes: ['quiz1', 'quiz2'],
    duration: '8 giờ',
    rating: 4.8,
    requirements: [
      'Kiến thức cơ bản về AI và Machine Learning',
      'Máy tính có kết nối internet',
      'Tinh thần học tập tích cực'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
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
      role: 'TEACHER',
      email: 'alice@teach.com',
      coursesEnrolled: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: ['Web Development', 'Programming'],
    thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7t_b8CO_lPSkjiQa6_giaw40gQAtnHayjsg&s',
    price: 29.99,
    studentsEnrolled: [],
    lessons: [
      { title: 'HTML cơ bản', description: 'Tìm hiểu về HTML và cấu trúc trang web' },
      { title: 'CSS cơ bản', description: 'Học cách tạo style cho trang web với CSS' }
    ],
    quizzes: ['quiz1'],
    duration: '6 giờ',
    rating: 4.5,
    requirements: [
      'Không cần kinh nghiệm lập trình',
      'Máy tính có kết nối internet',
      'Trình duyệt web hiện đại'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
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
      role: 'TEACHER',
      email: 'bob@teach.com',
      coursesEnrolled: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: ['Data Science', 'Analytics'],
    thumbnail: 'https://blogassets.leverageedu.com/blog/wp-content/uploads/2020/05/23151218/BA-Courses.png',
    price: 59.99,
    studentsEnrolled: [
      { _id: 'student3', firstName: 'Mike', lastName: 'Brown', username: 'mikebrown', password: 'hashedpassword', role: 'USER', email: 'mike@example.com', coursesEnrolled: [], createdAt: new Date(), updatedAt: new Date() },
    ],
    lessons: [
      { title: 'Giới thiệu về Data Science', description: 'Tổng quan về khoa học dữ liệu' },
      { title: 'Phân tích dữ liệu cơ bản', description: 'Các kỹ thuật phân tích dữ liệu cơ bản' },
      { title: 'Visualization dữ liệu', description: 'Học cách tạo biểu đồ và trực quan hóa dữ liệu' }
    ],
    quizzes: [],
    duration: '10 giờ',
    rating: 4.7,
    requirements: [
      'Kiến thức cơ bản về toán học',
      'Máy tính có kết nối internet',
      'Python cơ bản (khuyến nghị)'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];