import { FilterState, Course, Lesson, Quiz, User } from '@/app/types';
import { mockCourses } from '@/data/mockCourses';
import { mockLessons, mockUsers, mockQuizzes } from '@/data/mockData';

// Function to calculate total course duration from lessons and quizzes
const calculateTotalDuration = (lessons: Lesson[], quizzes: Quiz[]): number => {
  // Calculate total duration from lessons
  const lessonsDuration = lessons.reduce((total, lesson) => {
    // Use timeLimit if available, otherwise default to 0
    return total + (lesson.timeLimit || 0);
  }, 0);
  
  // Calculate total duration from quizzes
  const quizzesDuration = quizzes.reduce((total, quiz) => {
    // Use timeLimit if available, otherwise default to 0
    return total + (quiz.timeLimit || 0);
  }, 0);
  
  // Return the sum of both durations
  return lessonsDuration + quizzesDuration;
};

// Function to transform courseIds to full course objects if needed
const transformCourseIfNeeded = (course: Course) => {
  // Check if the course already has full lesson objects
  if (course.lessons && typeof course.lessons[0] === 'object') {
    return {
      ...course,
      totalDuration: calculateTotalDuration(course.lessons as Lesson[], course.quizzes as Quiz[])
    };
  }
  
  // If lessons are just IDs, replace with full lesson objects
  const fullLessons = (course.lessons as string[]).map((lessonId: string) => 
    mockLessons.find(l => l._id === lessonId)
  ).filter(Boolean) as Lesson[];
  
  // If quizzes are just IDs, replace with full quiz objects
  const fullQuizzes = (course.quizzes as string[]).map((quizId: string) => 
    mockQuizzes.find(q => q._id === quizId)
  ).filter(Boolean) as Quiz[];
  
  // If teacherId is a string, replace with full user object
  let teacherObj = course.teacherId;
  if (typeof course.teacherId === 'string') {
    const teacher = mockUsers.find(u => u._id === course.teacherId);
    teacherObj = teacher || course.teacherId;
  }
  
  // If studentsEnrolled are strings, replace with full user objects
  const studentsObj = course.studentsEnrolled.map((studentId: string | User) => {
    if (typeof studentId === 'string') {
      const student = mockUsers.find(u => u._id === studentId);
      return student || studentId;
    }
    return studentId;
  });
  
  return {
    ...course,
    teacherId: teacherObj,
    studentsEnrolled: studentsObj,
    lessons: fullLessons,
    quizzes: fullQuizzes,
    totalDuration: calculateTotalDuration(fullLessons, fullQuizzes)
  };
};

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const courseService = {
  // Lấy danh sách khóa học với phân trang và lọc
  getCourses: async (page: number, limit: number, filters?: FilterState, sortBy?: string, searchQuery?: string) => {
    // TODO: Implement API call when backend is ready
    // const queryParams = new URLSearchParams({
    //   page: page.toString(),
    //   limit: limit.toString(),
    //   ...(filters?.categories?.length && { categories: filters.categories.join(',') }),
    //   ...(filters?.instructors?.length && { instructors: filters.instructors.join(',') }),
    //   ...(filters?.prices?.length && { prices: filters.prices.join(',') }),
    //   ...(filters?.reviews?.length && { reviews: filters.reviews.join(',') }),
    //   ...(sortBy && { sortBy }),
    //   ...(searchQuery && { search: searchQuery }),
    // });

    // const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch courses');
    // }
    // return response.json();

    // Temporary mock implementation
    let filteredCourses = [...mockCourses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.teacherId.firstName.toLowerCase().includes(query) ||
        course.teacherId.lastName.toLowerCase().includes(query) ||
        course.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.categories?.length) {
        filteredCourses = filteredCourses.filter(course =>
          filters.categories.some(cat => course.categories.includes(cat))
        );
      }

      if (filters.instructors?.length) {
        filteredCourses = filteredCourses.filter(course =>
          filters.instructors.includes(course.teacherId.firstName + ' ' + course.teacherId.lastName)
        );
      }

      if (filters.prices?.length) {
        filteredCourses = filteredCourses.filter(course => {
          if (filters.prices.includes('All')) return true;
          if (filters.prices.includes('Free') && course.price === 0) return true;
          if (filters.prices.includes('Paid') && course.price > 0) return true;
          return false;
        });
      }

      if (filters.reviews?.length) {
        filteredCourses = filteredCourses.filter(course =>
          filters.reviews.includes(Math.floor(course.rating))
        );
      }
    }

    // Apply sorting
    if (sortBy) {
      filteredCourses.sort((a, b) => {
        switch (sortBy) {
          case 'Title a-z':
            return a.title.localeCompare(b.title);
          case 'Title z-a':
            return b.title.localeCompare(a.title);
          case 'Price high to low':
            return b.price - a.price;
          case 'Price low to high':
            return a.price - b.price;
          case 'Popular':
            return b.studentsEnrolled.length - a.studentsEnrolled.length;
          case 'Average Ratings':
            return b.rating - a.rating;
          case 'Newly published':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    return {
      courses: paginatedCourses,
      totalPages: Math.ceil(filteredCourses.length / limit)
    };
  },

  // Lấy chi tiết một khóa học
  getCourseById: async (id: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch course details');
    // }
    // return response.json();

    // Temporary mock implementation
    const course = mockCourses.find(c => c._id === id);
    if (!course) {
      throw new Error('Course not found');
    }
    return transformCourseIfNeeded(course);
  },

  // Lấy danh sách categories
  getCategories: async () => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/categories`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch categories');
    // }
    // return response.json();

    // Temporary mock implementation
    const categories = new Set<string>();
    mockCourses.forEach(course => {
      course.categories.forEach(category => categories.add(category));
    });
    return Array.from(categories).map(name => ({
      name,
      count: mockCourses.filter(c => c.categories.includes(name)).length,
      isActive: false
    }));
  },

  // Lấy danh sách instructors
  getInstructors: async () => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/instructors`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch instructors');
    // }
    // return response.json();

    // Temporary mock implementation
    const instructors = new Set<string>();
    mockCourses.forEach(course => {
      instructors.add(course.teacherId.firstName + ' ' + course.teacherId.lastName);
    });
    return Array.from(instructors).map(name => ({
      name,
      count: mockCourses.filter(c => c.teacherId.firstName + ' ' + c.teacherId.lastName === name).length,
      isActive: false
    }));
  },

  // Đăng ký khóa học
  enrollCourse: async (courseId: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ userId }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to enroll course');
    // }
    // return response.json();

    // Temporary mock implementation
    const course = mockCourses.find(c => c._id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return { success: true, message: 'Enrolled successfully' };
  },

  // Xóa khóa học
  deleteCourse: async (courseId: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to delete course');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log('Deleting course:', courseId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Course deleted successfully' };
  },

  // Hủy đăng ký học viên khỏi khóa học
  removeStudentFromCourse: async (courseId: string, studentId: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/students/${studentId}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to remove student from course');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log(`Removing student ${studentId} from course ${courseId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, message: 'Student removed successfully' };
  },
  
  // Cập nhật thứ tự bài học trong khóa học
  updateLessonOrder: async (courseId: string, lessonIds: string[]) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/reorder`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ lessonIds }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update lesson order');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log('Updating lesson order:', { courseId, lessonIds });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Lesson order updated successfully' };
  },
  
  // Cập nhật thứ tự bài kiểm tra trong khóa học
  updateQuizOrder: async (courseId: string, quizIds: string[]) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes/reorder`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ quizIds }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update quiz order');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log('Updating quiz order:', { courseId, quizIds });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Quiz order updated successfully' };
  },
  
  // Xóa bài học
  deleteLesson: async (courseId: string, lessonId: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to delete lesson');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log(`Deleting lesson ${lessonId} from course ${courseId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, message: 'Lesson deleted successfully' };
  },
  
  // Xóa bài kiểm tra
  deleteQuiz: async (courseId: string, quizId: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes/${quizId}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to delete quiz');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log(`Deleting quiz ${quizId} from course ${courseId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, message: 'Quiz deleted successfully' };
  },

  // Create a new course
  createCourse: async (courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'totalDuration'>) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(courseData),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to create course');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log('Creating course:', courseData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a unique ID
    const newId = `course-${Date.now()}`;
    
    // Calculate total duration from lesson and quiz timeLimits
    let totalDuration = 0;
    
    // If lessons are provided and they're full lesson objects (not just IDs)
    if (courseData.lessons && courseData.lessons.length > 0 && typeof courseData.lessons[0] === 'object') {
      totalDuration += (courseData.lessons as Lesson[]).reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
    }
    
    // If quizzes are provided and they're full quiz objects (not just IDs)
    if (courseData.quizzes && courseData.quizzes.length > 0 && typeof courseData.quizzes[0] === 'object') {
      totalDuration += (courseData.quizzes as Quiz[]).reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
    }
    
    // If lessons/quizzes are just IDs, we need to look them up
    if (courseData.lessons && courseData.lessons.length > 0 && typeof courseData.lessons[0] === 'string') {
      const lessonIds = courseData.lessons as string[];
      const lessonObjects = lessonIds.map(id => mockLessons.find(l => l._id === id)).filter(Boolean) as Lesson[];
      totalDuration += lessonObjects.reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
    }
    
    if (courseData.quizzes && courseData.quizzes.length > 0 && typeof courseData.quizzes[0] === 'string') {
      const quizIds = courseData.quizzes as string[];
      const quizObjects = quizIds.map(id => mockQuizzes.find(q => q._id === id)).filter(Boolean) as Quiz[];
      totalDuration += quizObjects.reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
    }
    
    const newCourse: Course = {
      _id: newId,
      ...courseData,
      totalDuration,
      registrations: 0, // Start with 0 registrations
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return { success: true, course: newCourse };
  },
  
  // Update an existing course
  updateCourse: async (courseId: string, courseData: Partial<Course>) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(courseData),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update course');
    // }
    // return response.json();

    // Temporary mock implementation
    console.log('Updating course:', { courseId, courseData });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find the existing course
    const existingCourse = mockCourses.find(c => c._id === courseId);
    if (!existingCourse) {
      throw new Error('Course not found');
    }
    
    // If lessons or quizzes have changed, recalculate the total duration
    let totalDuration = existingCourse.totalDuration;
    
    if (courseData.lessons || courseData.quizzes) {
      // Start with 0 and calculate from provided data
      totalDuration = 0;
      
      // Use provided lessons or fall back to existing ones
      const lessons = courseData.lessons || existingCourse.lessons;
      const quizzes = courseData.quizzes || existingCourse.quizzes;
      
      // Calculate from lessons
      if (lessons && lessons.length > 0) {
        if (typeof lessons[0] === 'object') {
          // If lessons are full objects
          totalDuration += (lessons as Lesson[]).reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
        } else {
          // If lessons are just IDs
          const lessonIds = lessons as string[];
          const lessonObjects = lessonIds.map(id => mockLessons.find(l => l._id === id)).filter(Boolean) as Lesson[];
          totalDuration += lessonObjects.reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
        }
      }
      
      // Calculate from quizzes
      if (quizzes && quizzes.length > 0) {
        if (typeof quizzes[0] === 'object') {
          // If quizzes are full objects
          totalDuration += (quizzes as Quiz[]).reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
        } else {
          // If quizzes are just IDs
          const quizIds = quizzes as string[];
          const quizObjects = quizIds.map(id => mockQuizzes.find(q => q._id === id)).filter(Boolean) as Quiz[];
          totalDuration += quizObjects.reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
        }
      }
    }
    
    // Update the course with new data and total duration
    const updatedCourse: Course = {
      ...existingCourse,
      ...courseData,
      totalDuration,
      updatedAt: new Date(),
    };
    
    return { success: true, course: updatedCourse };
  },

  // Lấy nội dung kết hợp (bài học và bài kiểm tra) của khóa học đã sắp xếp theo order
  getCourseContent: async (courseId: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/content`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch course content');
    // }
    // return response.json();

    // Temporary mock implementation
    const course = await courseService.getCourseById(courseId);
    
    // Ensure we work with the full Lesson and Quiz objects
    const lessonsArray = Array.isArray(course.lessons) 
      ? course.lessons.map(lesson => typeof lesson === 'string' 
          ? mockLessons.find(l => l._id === lesson) 
          : lesson).filter(Boolean)
      : [];
      
    const quizzesArray = Array.isArray(course.quizzes) 
      ? course.quizzes.map(quiz => typeof quiz === 'string' 
          ? mockQuizzes.find(q => q._id === quiz) 
          : quiz).filter(Boolean)
      : [];
    
    // Combine lessons and quizzes
    const combinedContent = [
      ...lessonsArray.map(lesson => ({ 
        ...lesson, 
        type: 'lesson',
        order: lesson.order || 999 // Default high order if not specified
      })),
      ...quizzesArray.map(quiz => ({ 
        ...quiz, 
        type: 'quiz',
        order: quiz.order || 999 // Default high order if not specified
      }))
    ];
    
    // Sort by order field
    return combinedContent.sort((a, b) => {
      if (a.order === undefined && b.order === undefined) return 0;
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      return a.order - b.order;
    });
  },
};