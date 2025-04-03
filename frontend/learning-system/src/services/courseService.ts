import { FilterState } from '@/app/types';
import { mockCourses } from '@/data/mockCourses';
import { mockLessons, mockUsers } from '@/data/mockData';

// Function to transform courseIds to full course objects if needed
const transformCourseIfNeeded = (course: any) => {
  // Check if the course already has full lesson objects
  if (course.lessons && typeof course.lessons[0] === 'object') {
    return course;
  }
  
  // If lessons are just IDs, replace with full lesson objects
  const fullLessons = course.lessons.map((lessonId: string) => 
    mockLessons.find(l => l._id === lessonId)
  ).filter(Boolean);
  
  // If teacherId is a string, replace with full user object
  let teacherObj = course.teacherId;
  if (typeof course.teacherId === 'string') {
    teacherObj = mockUsers.find(u => u._id === course.teacherId);
  }
  
  // If studentsEnrolled are strings, replace with full user objects
  const studentsObj = course.studentsEnrolled.map((studentId: string | any) => {
    if (typeof studentId === 'string') {
      return mockUsers.find(u => u._id === studentId);
    }
    return studentId;
  }).filter(Boolean);
  
  return {
    ...course,
    teacherId: teacherObj,
    studentsEnrolled: studentsObj,
    lessons: fullLessons
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
}; 