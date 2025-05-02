import { FilterState, Course, Lesson, Quiz, User, EQuestion } from '@/app/types';
import { mockCourses } from '../data/mockCourses';
import { mockLessons, mockUsers, mockQuizzes } from '@/data/mockData';

// Function to calculate total course duration from lessons and quizzes
const calculateTotalDuration = (lessons: Lesson[], quizzes: Quiz[]): number => {
  const lessonsDuration = lessons.reduce((total, lesson) => total + (lesson.timeLimit || 0), 0);
  const quizzesDuration = quizzes.reduce((total, quiz) => total + (quiz.timeLimit || 0), 0);
  return lessonsDuration + quizzesDuration;
};

// Function to transform courseIds to full course objects if needed
const transformCourseIfNeeded = (course: Course) => {
  // If lessons are already full objects, calculate duration and return
  if (course.lessons && typeof course.lessons[0] === 'object') {
    return {
      ...course,
      totalDuration: calculateTotalDuration(course.lessons as Lesson[], course.quizzes as Quiz[])
    };
  }

  // Replace lesson IDs with full lesson objects
  const fullLessons = (course.lessons as string[]).map((lessonId: string) => 
    mockLessons.find((l: Lesson) => l._id === lessonId)
  ).filter(Boolean) as Lesson[];

  // Replace quiz IDs with full quiz objects
  const fullQuizzes = (course.quizzes as string[]).map((quizId: string) => {
    const quiz = mockQuizzes.find(q => q._id === quizId);
    if (quiz) {
      return {
        ...quiz,
        questions: quiz.questions.map(question => ({
          ...question,
          correctAnswer: Array.isArray(question.correctAnswer) 
            ? question.correctAnswer 
            : [question.correctAnswer], // Ensure correctAnswer is string[]
          equestion: {} as EQuestion
        }))
      };
    }
    return undefined;
  }).filter(Boolean) as Quiz[];

  // Handle teacherId
  let teacherObj = course.teacherId;
  if (typeof course.teacherId === 'string') {
    const teacher = (mockUsers as User[]).find((u: User) => u._id === course.teacherId);
    teacherObj = teacher || course.teacherId;
  }

  // Handle studentsEnrolled
  const studentsObj = course.studentsEnrolled.map((studentId: string | User) => {
    if (typeof studentId === 'string') {
      const student = (mockUsers as User[]).find((u: User) => u._id === studentId);
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

export const courseService = {
  // Get courses with pagination and filters
  getCourses: async (page: number, limit: number, filters?: FilterState, sortBy?: string, searchQuery?: string) => {
    let filteredCourses = [...mockCourses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCourses = filteredCourses.filter(course => {
        const teacher = typeof course.teacherId === 'string'
          ? mockUsers.find(u => u._id === course.teacherId)
          : course.teacherId;
        return (
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          (teacher && `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(query)) ||
          course.categories.some(cat => cat.toLowerCase().includes(query))
        );
      });
    }

    // Apply filters
    if (filters) {
      if (filters.categories?.length) {
        filteredCourses = filteredCourses.filter(course =>
          filters.categories.some(cat => course.categories.includes(cat))
        );
      }

      if (filters.instructors?.length) {
        filteredCourses = filteredCourses.filter(course => {
          const teacher = typeof course.teacherId === 'string'
            ? mockUsers.find(u => u._id === course.teacherId)
            : course.teacherId;
          return teacher && filters.instructors.includes(`${teacher.firstName} ${teacher.lastName}`);
        });
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
      courses: paginatedCourses.map(transformCourseIfNeeded),
      totalPages: Math.ceil(filteredCourses.length / limit)
    };
  },

  // Get course by ID
  getCourseById: async (id: string) => {
    const course = mockCourses.find(c => c._id === id);
    if (!course) {
      throw new Error('Course not found');
    }
    return transformCourseIfNeeded(course);
  },

  // Get categories
  getCategories: async () => {
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

  // Get instructors
  getInstructors: async () => {
    const instructors = new Set<string>();
    mockCourses.forEach(course => {
      const teacher = typeof course.teacherId === 'string'
        ? mockUsers.find(u => u._id === course.teacherId)
        : course.teacherId;
      if (teacher) {
        instructors.add(`${teacher.firstName} ${teacher.lastName}`);
      }
    });
    return Array.from(instructors).map(name => ({
      name,
      count: mockCourses.filter(c => {
        const teacher = typeof c.teacherId === 'string'
          ? mockUsers.find(u => u._id === c.teacherId)
          : c.teacherId;
        return teacher && `${teacher.firstName} ${teacher.lastName}` === name;
      }).length,
      isActive: false
    }));
  },

  // Enroll in a course
  enrollCourse: async (courseId: string) => {
    const course = mockCourses.find(c => c._id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return { success: true, message: 'Enrolled successfully' };
  },

  // Delete a course
  deleteCourse: async (courseId: string) => {
    console.log('Deleting course:', courseId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Course deleted successfully' };
  },

  // Remove student from course
  removeStudentFromCourse: async (courseId: string, studentId: string) => {
    console.log(`Removing student ${studentId} from course ${courseId}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Student removed successfully' };
  },

  // Update lesson order
  updateLessonOrder: async (courseId: string, lessonIds: string[]) => {
    console.log('Updating lesson order:', { courseId, lessonIds });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Lesson order updated successfully' };
  },

  // Update quiz order
  updateQuizOrder: async (courseId: string, quizIds: string[]) => {
    console.log('Updating quiz order:', { courseId, quizIds });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Quiz order updated successfully' };
  },

  // Delete lesson
  deleteLesson: async (courseId: string, lessonId: string) => {
    console.log(`Deleting lesson ${lessonId} from course ${courseId}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Lesson deleted successfully' };
  },

  // Delete quiz
  deleteQuiz: async (courseId: string, quizId: string) => {
    console.log(`Deleting quiz ${quizId} from course ${courseId}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Quiz deleted successfully' };
  },

  // Create a new course
  createCourse: async (courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'totalDuration'>) => {
    console.log('Creating course:', courseData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newId = `course-${Date.now()}`;
    let totalDuration = 0;

    // Calculate duration from lessons
    if (courseData.lessons && courseData.lessons.length > 0) {
      if (typeof courseData.lessons[0] === 'object') {
        totalDuration += (courseData.lessons as Lesson[]).reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
      } else {
        const lessonIds = courseData.lessons as string[];
        const lessonObjects = lessonIds.map(id => mockLessons.find(l => l._id === id)).filter(Boolean) as Lesson[];
        totalDuration += lessonObjects.reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
      }
    }

    // Calculate duration from quizzes
    if (courseData.quizzes && courseData.quizzes.length > 0) {
      if (typeof courseData.quizzes[0] === 'object') {
        totalDuration += (courseData.quizzes as Quiz[]).reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
      } else {
        const quizIds = courseData.quizzes as string[];
        const quizObjects = quizIds.map(id => {
          const quiz = mockQuizzes.find(q => q._id === id);
          if (quiz) {
            return {
              ...quiz,
              questions: quiz.questions.map(question => ({
                ...question,
                correctAnswer: Array.isArray(question.correctAnswer) 
                  ? question.correctAnswer 
                  : [question.correctAnswer],
                equestion: {} as EQuestion
              }))
            };
          }
          return undefined;
        }).filter(Boolean) as Quiz[];
        totalDuration += quizObjects.reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
      }
    }

    const newCourse: Course = {
      _id: newId,
      ...courseData,
      totalDuration,
      registrations: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { success: true, course: newCourse };
  },

  // Update an existing course
  updateCourse: async (courseId: string, courseData: Partial<Course>) => {
    console.log('Updating course:', { courseId, courseData });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingCourse = mockCourses.find(c => c._id === courseId);
    if (!existingCourse) {
      throw new Error('Course not found');
    }

    let totalDuration = existingCourse.totalDuration;
    if (courseData.lessons || courseData.quizzes) {
      totalDuration = 0;
      const lessons = courseData.lessons || existingCourse.lessons;
      const quizzes = courseData.quizzes || existingCourse.quizzes;

      if (lessons && lessons.length > 0) {
        if (typeof lessons[0] === 'object') {
          totalDuration += (lessons as Lesson[]).reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
        } else {
          const lessonIds = lessons as string[];
          const lessonObjects = lessonIds.map(id => mockLessons.find(l => l._id === id)).filter(Boolean) as Lesson[];
          totalDuration += lessonObjects.reduce((sum, lesson) => sum + (lesson.timeLimit || 0), 0);
        }
      }

      if (quizzes && quizzes.length > 0) {
        if (typeof quizzes[0] === 'object') {
          totalDuration += (quizzes as Quiz[]).reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
        } else {
          const quizIds = quizzes as string[];
          const quizObjects = quizIds.map(id => {
            const quiz = mockQuizzes.find(q => q._id === id);
            if (quiz) {
              return {
                ...quiz,
                questions: quiz.questions.map(question => ({
                  ...question,
                  correctAnswer: Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer 
                    : [question.correctAnswer],
                  equestion: {} as EQuestion
                }))
              };
            }
            return undefined;
          }).filter(Boolean) as Quiz[];
          totalDuration += quizObjects.reduce((sum, quiz) => sum + (quiz.timeLimit || 0), 0);
        }
      }
    }

    const updatedCourse: Course = {
      ...existingCourse,
      ...courseData,
      totalDuration,
      updatedAt: new Date(),
    };

    return { success: true, course: updatedCourse };
  },

  // Get combined course content (lessons and quizzes) sorted by order
  getCourseContent: async (courseId: string) => {
    const course = await courseService.getCourseById(courseId);

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

    const combinedContent = [
      ...lessonsArray.map(lesson => ({ 
        ...lesson, 
        type: 'lesson',
        order: lesson?.order || 999
      })),
      ...quizzesArray.map(quiz => quiz ? ({ 
        ...quiz, 
        type: 'quiz',
        order: quiz.order || 999
      }) : null).filter(Boolean)
    ];

    return combinedContent.sort((a, b) => {
      if (!a || !b) return 0;
      if (a.order === undefined && b.order === undefined) return 0;
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      if (!a || !b) return 0;
      return (a.order || 0) - (b.order || 0);
    });
  },
};