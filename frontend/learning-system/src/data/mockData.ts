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
      _id: 'teacher2',
      username: 'alicej',
      password: 'hashedpassword',
      role: 'ROLE_TEACHER',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@teach.com',
      phone: '0123456789',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Female',
      profileImage: 'https://example.com/alice-profile.jpg',
      coursesEnrolled: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'teacher3',
      username: 'bobsmith',
      password: 'hashedpassword',
      role: 'ROLE_TEACHER',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@teach.com',
      phone: '0123456789',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      profileImage: 'https://example.com/bob-profile.jpg',
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
    },
    {
      _id: 'student2',
      username: 'janesmith',
      password: 'hashedpassword',
      role: 'ROLE_USER',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '0123456789',
      dateOfBirth: new Date('1995-01-01'),
      gender: 'Female',
      profileImage: 'https://example.com/jane-profile.jpg',
      coursesEnrolled: ['1'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'student3',
      username: 'mikebrown',
      password: 'hashedpassword',
      role: 'ROLE_USER',
      firstName: 'Mike',
      lastName: 'Brown',
      email: 'mike@example.com',
      phone: '0123456789',
      dateOfBirth: new Date('1995-01-01'),
      gender: 'Male',
      profileImage: 'https://example.com/mike-profile.jpg',
      coursesEnrolled: ['3'],
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
      teacherId: 'teacher2',
      categories: ['Web Development', 'Programming'],
      thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7t_b8CO_lPSkjiQa6_giaw40gQAtnHayjsg&s',
      price: 29.99,
      studentsEnrolled: [],
      lessons: ['lesson5', 'lesson6'],
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
      teacherId: 'teacher3',
      categories: ['Data Science', 'Analytics'],
      thumbnail: 'https://blogassets.leverageedu.com/blog/wp-content/uploads/2020/05/23151218/BA-Courses.png',
      price: 59.99,
      studentsEnrolled: ['student3'],
      lessons: ['lesson7', 'lesson8', 'lesson9'],
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
  
  // Collection: lessons
  export const mockLessons = [
    {
      _id: 'lesson1',
      courseId: '1',
      title: 'Giới thiệu về Prompt Engineering',
      content: `Prompt engineering là kỹ thuật thiết kế và tối ưu hóa các prompt (câu lệnh đầu vào) để tương tác hiệu quả với các mô hình AI như GPT-4, Claude, hay Gemini. 
      
      Trong bài học này, chúng ta sẽ tìm hiểu về tầm quan trọng của việc tạo ra các prompt chất lượng và cách thức hoạt động cơ bản của các mô hình ngôn ngữ lớn (LLMs).
      
      Các nội dung chính:
      - Khái niệm về prompt engineering
      - Tại sao prompt engineering quan trọng
      - Các thành phần cơ bản của một prompt hiệu quả
      - Ứng dụng thực tế của prompt engineering`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/prompt-engineering-intro.pdf',
        'https://example.com/prompt-engineering-cheatsheet.pdf'
      ],
      order: 1,
      timeLimit: 2,
      createdAt: new Date(),
      description: 'Tìm hiểu cơ bản về prompt engineering và tầm quan trọng của nó'
    },
    {
      _id: 'lesson2',
      courseId: '1',
      title: 'Các kỹ thuật Prompt cơ bản',
      content: `Trong bài học này, chúng ta sẽ tìm hiểu về các kỹ thuật cơ bản để tạo prompt hiệu quả khi làm việc với các mô hình AI.
      
      Các kỹ thuật bao gồm:
      1. Zero-shot prompting: Yêu cầu AI thực hiện nhiệm vụ mà không cung cấp ví dụ
      2. Few-shot prompting: Cung cấp một vài ví dụ trong prompt để AI học theo
      3. Chain-of-thought: Hướng dẫn AI suy nghĩ từng bước một
      4. Role prompting: Gán vai trò cụ thể cho AI
      
      Chúng ta sẽ thực hành với từng kỹ thuật và phân tích kết quả.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/basic-prompt-techniques.pdf',
        'https://example.com/prompt-examples.zip'
      ],
      order: 2,
      timeLimit: 0.2,
      createdAt: new Date(),
      description: 'Học các kỹ thuật cơ bản để tạo prompt hiệu quả'
    },
    {
      _id: 'lesson3',
      courseId: '1',
      title: 'Prompt nâng cao',
      content: `Bài học này đi sâu vào các kỹ thuật prompt nâng cao để tối ưu hóa kết quả từ các mô hình AI.
      
      Chúng ta sẽ tìm hiểu:
      - Multimodal prompting: Kết hợp văn bản và hình ảnh
      - Template-based prompting: Sử dụng template để tạo prompt có cấu trúc
      - Recursive refinement: Lặp lại và cải thiện kết quả qua nhiều lần prompt
      - Context stuffing: Tối ưu hóa cách sử dụng context window
      
      Bài học cũng bao gồm các best practices và cách tránh các lỗi thường gặp.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/advanced-prompt-techniques.pdf',
        'https://example.com/prompt-optimization-guide.pdf'
      ],
      order: 6,
      timeLimit: 0.2,
      createdAt: new Date(),
      description: 'Khám phá các kỹ thuật prompt nâng cao và best practices'
    },
    {
      _id: 'lesson4',
      courseId: '1',
      title: 'Thực hành và dự án',
      content: `Trong bài học cuối cùng của khóa học, chúng ta sẽ áp dụng tất cả các kỹ thuật đã học vào các dự án thực tế.
      
      Các dự án thực hành:
      1. Tạo một chatbot trợ lý khách hàng
      2. Xây dựng hệ thống phân tích văn bản tự động
      3. Thiết kế prompt để tạo nội dung theo thương hiệu
      4. Tối ưu hóa prompt cho ứng dụng cụ thể
      
      Bạn sẽ được hướng dẫn từng bước và nhận phản hồi chi tiết về các prompt đã tạo.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/prompt-projects.pdf',
        'https://example.com/project-templates.zip',
        'https://example.com/evaluation-criteria.pdf'
      ],
      order: 4,
      createdAt: new Date(),
      description: 'Áp dụng kiến thức vào các dự án thực tế',
      timeLimit: 0.2,
    },
    
    // Course 2: Introduction to Web Development
    {
      _id: 'lesson5',
      courseId: '2',
      title: 'HTML cơ bản',
      content: `HTML (HyperText Markup Language) là ngôn ngữ đánh dấu tiêu chuẩn cho các trang web.
      
      Trong bài học này, chúng ta sẽ tìm hiểu:
      - Cấu trúc cơ bản của một trang HTML
      - Các thẻ HTML phổ biến và cách sử dụng
      - Thuộc tính và giá trị
      - Semantic HTML và tầm quan trọng của nó
      - Cách tổ chức nội dung trang web
      
      Bạn sẽ thực hành xây dựng một trang web đơn giản từ đầu bằng HTML.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/html-basics.pdf',
        'https://example.com/html-cheatsheet.pdf'
      ],
      order: 1,
      createdAt: new Date(),
      description: 'Tìm hiểu về HTML và cấu trúc trang web',
      timeLimit: 0.2,
    },
    {
      _id: 'lesson6',
      courseId: '2',
      title: 'CSS cơ bản',
      content: `CSS (Cascading Style Sheets) là ngôn ngữ được sử dụng để tạo style cho các trang web HTML.
      
      Trong bài học này, chúng ta sẽ tìm hiểu:
      - Cú pháp CSS và cách hoạt động
      - Selectors và độ ưu tiên
      - Box model và layout
      - Typography và màu sắc
      - Responsive design cơ bản
      
      Bạn sẽ thực hành tạo style cho trang web HTML đã xây dựng ở bài trước.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/css-basics.pdf',
        'https://example.com/css-exercises.zip'
      ],
      order: 2,
      createdAt: new Date(),
      description: 'Học cách tạo style cho trang web với CSS',
      timeLimit: 0.2,
    },
    
    // Course 3: Data Science Fundamentals
    {
      _id: 'lesson7',
      courseId: '3',
      title: 'Giới thiệu về Data Science',
      content: `Data Science là lĩnh vực liên ngành kết hợp các kỹ năng về thống kê, toán học, lập trình và kiến thức chuyên ngành để trích xuất giá trị từ dữ liệu.
      
      Trong bài học này, chúng ta sẽ tìm hiểu:
      - Định nghĩa và phạm vi của Data Science
      - Các vai trò khác nhau trong ngành
      - Quy trình phân tích dữ liệu
      - Các công cụ và ngôn ngữ phổ biến
      - Ứng dụng thực tế của Data Science
      
      Bạn sẽ được giới thiệu tổng quan về hành trình học Data Science.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/intro-data-science.pdf',
        'https://example.com/data-science-roadmap.pdf'
      ],
      order: 1,
      createdAt: new Date(),
      description: 'Tổng quan về khoa học dữ liệu',
      timeLimit: 0.2,
    },
    {
      _id: 'lesson8',
      courseId: '3',
      title: 'Phân tích dữ liệu cơ bản',
      content: `Phân tích dữ liệu là quá trình kiểm tra, làm sạch, biến đổi và mô hình hóa dữ liệu để khám phá thông tin hữu ích.
      
      Trong bài học này, chúng ta sẽ tìm hiểu:
      - Thu thập và làm sạch dữ liệu
      - Thống kê mô tả cơ bản
      - Phân tích khám phá dữ liệu (EDA)
      - Tìm kiếm mẫu và tương quan
      - Báo cáo kết quả phân tích
      
      Bạn sẽ thực hành phân tích một bộ dữ liệu thực tế bằng Python và thư viện pandas.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/data-analysis-basics.pdf',
        'https://example.com/sample-dataset.csv',
        'https://example.com/analysis-notebook.ipynb'
      ],
      order: 2,
      createdAt: new Date(),
      description: 'Các kỹ thuật phân tích dữ liệu cơ bản',
      timeLimit: 0.2,
    },
    {
      _id: 'lesson9',
      courseId: '3',
      title: 'Visualization dữ liệu',
      content: `Visualization dữ liệu là quá trình biểu diễn dữ liệu dưới dạng đồ họa để giúp người xem hiểu và khám phá dữ liệu dễ dàng hơn.
      
      Trong bài học này, chúng ta sẽ tìm hiểu:
      - Nguyên tắc thiết kế visualization hiệu quả
      - Các loại biểu đồ và khi nào nên sử dụng
      - Thư viện visualization trong Python (Matplotlib, Seaborn, Plotly)
      - Tạo dashboard tương tác
      - Kể chuyện với dữ liệu
      
      Bạn sẽ thực hành tạo các visualization từ bộ dữ liệu đã phân tích ở bài trước.`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      materials: [
        'https://example.com/data-visualization.pdf',
        'https://example.com/visualization-notebook.ipynb'
      ],
      order: 3,
      createdAt: new Date(),
      description: 'Học cách tạo biểu đồ và trực quan hóa dữ liệu',
      timeLimit: 0.2,
    }
  ];
  
  // Collection: quizzes
  export const mockQuizzes = [
    {
      _id: 'quiz1',
      courseId: '1',
      title: 'Kiểm tra Prompt Engineering',
      questions: [
        {
          question: 'Prompt Engineering là gì?',
          options: [
            'Kỹ thuật thiết kế prompt cho AI',
            'Ngôn ngữ lập trình mới',
            'Công cụ thiết kế web',
            'Phương pháp marketing'
          ],
          correctAnswer: 'Kỹ thuật thiết kế prompt cho AI'
        },
        {
          question: 'Zero-shot prompting là gì?',
          options: [
            'Yêu cầu AI thực hiện nhiệm vụ mà không cung cấp ví dụ',
            'Yêu cầu AI hoàn thành nhiệm vụ với 0 token',
            'Phương pháp sử dụng AI mà không cần internet',
            'Kỹ thuật tạo hình ảnh từ văn bản không cần ví dụ'
          ],
          correctAnswer: 'Yêu cầu AI thực hiện nhiệm vụ mà không cung cấp ví dụ'
        },
        {
          question: 'Chain-of-thought prompting giúp ích trong trường hợp nào?',
          options: [
            'Khi cần AI giải quyết các vấn đề phức tạp từng bước một',
            'Khi muốn AI viết câu chuyện dài',
            'Khi muốn nối nhiều AI với nhau',
            'Khi cần AI trả lời ngắn gọn'
          ],
          correctAnswer: 'Khi cần AI giải quyết các vấn đề phức tạp từng bước một'
        }
      ],
      passingScore: 60,
      timeLimit: 1,
      order: 5,
      createdAt: new Date(),
      description: 'Kiểm tra kiến thức về Prompt Engineering cơ bản'
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
        },
        {
          question: 'Thẻ nào được sử dụng để tạo tiêu đề lớn nhất trong HTML?',
          options: [
            '<h1>',
            '<heading>',
            '<head>',
            '<title>'
          ],
          correctAnswer: '<h1>'
        },
        {
          question: 'Thuộc tính nào được sử dụng để xác định URL của liên kết?',
          options: [
            'href',
            'src',
            'link',
            'url'
          ],
          correctAnswer: 'href'
        }
      ],
      passingScore: 60,
      timeLimit: 1,
      order: 3,
      createdAt: new Date(),
      description: 'Kiểm tra kiến thức HTML cơ bản'
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
        },
        {
          question: 'Ngôn ngữ lập trình nào được sử dụng phổ biến trong Data Science?',
          options: [
            'Python',
            'HTML',
            'Swift',
            'C#'
          ],
          correctAnswer: 'Python'
        },
        {
          question: 'Thư viện nào được sử dụng cho Visualization dữ liệu trong Python?',
          options: [
            'Matplotlib',
            'React',
            'TensorFlow',
            'jQuery'
          ],
          correctAnswer: 'Matplotlib'
        },
        {
          question: 'EDA là viết tắt của?',
          options: [
            'Exploratory Data Analysis',
            'Electronic Data Analysis',
            'Extended Data Architecture',
            'Expert Data Acquisition'
          ],
          correctAnswer: 'Exploratory Data Analysis'
        }
      ],
      passingScore: 60,
      timeLimit: 1,
      order: 4,
      createdAt: new Date(),
      description: 'Kiểm tra kiến thức cơ bản về khoa học dữ liệu'
    },
    {
      _id: 'quiz4',
      courseId: '1',
      title: 'Kiểm tra Prompt nâng cao',
      questions: [
        {
          question: 'Template-based prompting dùng để làm gì?',
          options: [
            'Sử dụng template để tạo prompt có cấu trúc nhất quán',
            'Tạo template cho website',
            'Tạo mẫu code tự động',
            'Tự động hóa quy trình làm việc với AI'
          ],
          correctAnswer: 'Sử dụng template để tạo prompt có cấu trúc nhất quán'
        },
        {
          question: 'Multimodal prompting là gì?',
          options: [
            'Kết hợp văn bản và hình ảnh trong prompt',
            'Sử dụng nhiều ngôn ngữ trong prompt',
            'Tạo nhiều prompt cùng lúc',
            'Sử dụng nhiều AI cùng lúc'
          ],
          correctAnswer: 'Kết hợp văn bản và hình ảnh trong prompt'
        }
      ],
      passingScore: 70,
      timeLimit: 1,
      order: 3,
      createdAt: new Date(),
      description: 'Kiểm tra kiến thức nâng cao về Prompt Engineering'
    }
  ];
  
  // Collection: enrollments
  export const mockEnrollments = [
    {
      _id: 'enrollment1',
      userId: 'student1',
      courseId: '1',
      progress: 67,
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