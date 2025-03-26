// Collection: users
export const mockUsers = [
  {
    _id: 'user1',
    username: 'admin',
    password: 'hashedpassword',
    role: 'ROLE_ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '0123456789',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'Other',
    profileImage: 'https://example.com/admin-profile.jpg',
    coursesEnrolled: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'teacher1',
    username: 'google',
    password: 'hashedpassword',
    role: 'ROLE_TEACHER',
    firstName: 'Google',
    lastName: 'Career Certificates',
    email: 'google@certificates.com',
    phone: '0123456789',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'Other',
    profileImage: 'https://example.com/google-profile.jpg',
    coursesEnrolled: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'student1',
    username: 'johndoe',
    password: 'hashedpassword',
    role: 'ROLE_USER',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '0123456789',
    dateOfBirth: new Date('1995-01-01'),
    gender: 'Male',
    profileImage: 'https://example.com/john-profile.jpg',
    coursesEnrolled: ['1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Collection: courses
export const mockCourses = [
  {
    _id: '1',
    title: 'Google Prompting Essentials',
    description: 'Nhận thức cơ bản về một chủ đề mới, kỹ năng nghề nghiệp cao cấp',
    teacherId: 'teacher1',
    categories: ['Prompt Engineering', 'AI Basics'],
    thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.ctfassets.net/wp1lcwdav1p1/DMFk42PH8L9y9MeQ5xc7I/c55cade640bb097b0e5429b780ff7c98/redesigned-hero-image.png?auto=format%2Ccompress&dpr=2',
    price: 49.99,
    studentsEnrolled: ['student1', 'student2'],
    lessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4'],
    quizzes: ['quiz1'],
    createdAt: new Date(),
    updatedAt: new Date(),
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
    lessons: ['lesson3', 'lesson4'],
    quizzes: ['quiz2'],
    createdAt: new Date(),
    updatedAt: new Date(),
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
    lessons: ['lesson5', 'lesson6', 'lesson7'],
    quizzes: ['quiz3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Collection: lessons
export const mockLessons = [
  {
    _id: 'lesson1',
    courseId: '1',
    title: 'Giới thiệu về Prompt Engineering',
    content: 'Nội dung chi tiết về Prompt Engineering...',
    videoUrl: 'https://example.com/videos/prompt-engineering-intro.mp4',
    materials: [
      'https://example.com/materials/prompt-engineering-slides.pdf',
      'https://example.com/materials/prompt-engineering-examples.pdf'
    ],
    order: 1,
    createdAt: new Date(),
  },
  {
    _id: 'lesson2',
    courseId: '1',
    title: 'Các kỹ thuật Prompt cơ bản',
    content: 'Nội dung chi tiết về các kỹ thuật cơ bản...',
    videoUrl: 'https://example.com/videos/prompt-techniques.mp4',
    materials: [
      'https://example.com/materials/prompt-techniques-slides.pdf'
    ],
    order: 2,
    createdAt: new Date(),
  },
  {
    _id: 'lesson3',
    courseId: '2',
    title: 'HTML cơ bản',
    content: 'Nội dung chi tiết về HTML...',
    videoUrl: 'https://example.com/videos/html-basics.mp4',
    materials: [
      'https://example.com/materials/html-slides.pdf',
      'https://example.com/materials/html-examples.zip'
    ],
    order: 1,
    createdAt: new Date(),
  },
  {
    _id: 'lesson4',
    courseId: '2',
    title: 'CSS cơ bản',
    content: 'Nội dung chi tiết về CSS...',
    videoUrl: 'https://example.com/videos/css-basics.mp4',
    materials: [
      'https://example.com/materials/css-slides.pdf'
    ],
    order: 2,
    createdAt: new Date(),
  },
  {
    _id: 'lesson5',
    courseId: '3',
    title: 'Giới thiệu về Data Science',
    content: 'Nội dung chi tiết về Data Science...',
    videoUrl: 'https://example.com/videos/data-science-intro.mp4',
    materials: [
      'https://example.com/materials/data-science-slides.pdf'
    ],
    order: 1,
    createdAt: new Date(),
  },
  {
    _id: 'lesson6',
    courseId: '3',
    title: 'Phân tích dữ liệu cơ bản',
    content: 'Nội dung chi tiết về phân tích dữ liệu...',
    videoUrl: 'https://example.com/videos/data-analysis.mp4',
    materials: [
      'https://example.com/materials/data-analysis-slides.pdf'
    ],
    order: 2,
    createdAt: new Date(),
  },
  {
    _id: 'lesson7',
    courseId: '3',
    title: 'Visualization dữ liệu',
    content: 'Nội dung chi tiết về visualization...',
    videoUrl: 'https://example.com/videos/data-visualization.mp4',
    materials: [
      'https://example.com/materials/visualization-slides.pdf'
    ],
    order: 3,
    createdAt: new Date(),
  }
];

// Collection: quizzes
export const mockQuizzes = [
  {
    _id: 'quiz1',
    courseId: '1',
    title: 'Kiểm tra kiến thức Prompt Engineering',
    questions: [
      {
        question: 'Prompt Engineering là gì?',
        options: [
          'Kỹ thuật tạo câu lệnh cho AI',
          'Kỹ thuật lập trình web',
          'Kỹ thuật thiết kế UI',
          'Kỹ thuật marketing'
        ],
        correctAnswer: 'Kỹ thuật tạo câu lệnh cho AI'
      },
      {
        question: 'Đâu là yếu tố quan trọng nhất trong Prompt Engineering?',
        options: [
          'Độ dài của prompt',
          'Tính rõ ràng và cụ thể',
          'Số lượng từ khóa',
          'Ngôn ngữ sử dụng'
        ],
        correctAnswer: 'Tính rõ ràng và cụ thể'
      }
    ],
    passingScore: 70,
    createdAt: new Date(),
  },
  {
    _id: 'quiz2',
    courseId: '2',
    title: 'Kiểm tra HTML cơ bản',
    questions: [
      {
        question: 'HTML là viết tắt của gì?',
        options: [
          'Hyper Text Markup Language',
          'High Text Markup Language',
          'Hyperlink and Text Markup Language',
          'Home Tool Markup Language'
        ],
        correctAnswer: 'Hyper Text Markup Language'
      }
    ],
    passingScore: 60,
    createdAt: new Date(),
  },
  {
    _id: 'quiz3',
    courseId: '3',
    title: 'Kiểm tra Data Science cơ bản',
    questions: [
      {
        question: 'Data Science là gì?',
        options: [
          'Khoa học dữ liệu',
          'Lập trình web',
          'Thiết kế UI',
          'Marketing'
        ],
        correctAnswer: 'Khoa học dữ liệu'
      }
    ],
    passingScore: 60,
    createdAt: new Date(),
  }
];

// Collection: enrollments
export const mockEnrollments = [
  {
    _id: 'enrollment1',
    userId: 'student1',
    courseId: '1',
    progress: 75,
    status: 'INPROGESS',
    score: 85,
    completedAt: null,
  },
  {
    _id: 'enrollment2',
    userId: 'student2',
    courseId: '1',
    progress: 100,
    status: 'DONE',
    score: 90,
    completedAt: new Date(),
  },
  {
    _id: 'enrollment3',
    userId: 'student3',
    courseId: '3',
    progress: 30,
    status: 'INPROGESS',
    score: null,
    completedAt: null,
  }
];

// Collection: images
export const mockImages = [
  {
    _id: 'image1',
    type: 'Banner',
    imageUrl: 'https://example.com/images/banner1.jpg',
    altText: 'Banner chào mừng khóa học mới',
    createdAt: new Date(),
  },
  {
    _id: 'image2',
    type: 'Featured',
    imageUrl: 'https://example.com/images/featured1.jpg',
    altText: 'Khóa học nổi bật tuần này',
    createdAt: new Date(),
  }
];

// Collection: reviews
export const mockReviews = [
  {
    _id: 'review1',
    userId: 'student1',
    courseId: '1',
    rating: 5,
    comment: 'Khóa học rất hay và bổ ích!',
    createdAt: new Date(),
  },
  {
    _id: 'review2',
    userId: 'student2',
    courseId: '1',
    rating: 4,
    comment: 'Nội dung tốt, giảng viên nhiệt tình.',
    createdAt: new Date(),
  },
  {
    _id: 'review3',
    userId: 'student3',
    courseId: '3',
    rating: 5,
    comment: 'Khóa học cung cấp kiến thức thực tế và hữu ích.',
    createdAt: new Date(),
  }
]; 