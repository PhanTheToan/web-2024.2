import { mockEnrollments, mockUsers, mockCourses } from '@/data/mockData';

// Types for Enrollment-related operations
interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  progress: number;
  status: 'ENROLLED' | 'INPROGESS' | 'DONE';
  score: number | null;
  completedAt: Date | null;
}

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const enrollmentService = {
  // Đăng ký khóa học
  enrollCourse: async (userId: string, courseId: string): Promise<Enrollment> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/enrollments`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ userId, courseId }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to enroll in course');
    // }
    // return response.json();

    // Temporary mock implementation
    // Check if user and course exist
    const user = mockUsers.find(u => u._id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const course = mockCourses.find(c => c._id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if enrollment already exists
    const existingEnrollment = mockEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );
    
    if (existingEnrollment) {
      return existingEnrollment as Enrollment;
    }

    // Create new enrollment
    const newEnrollment = {
      _id: `enrollment${mockEnrollments.length + 1}`,
      userId,
      courseId,
      progress: 0,
      status: 'ENROLLED' as const,
      score: null,
      completedAt: null,
    };

    // In a real app, this would save to the database
    // For now, we just return the new enrollment
    return newEnrollment;
  },

  // Lấy thông tin đăng ký khóa học
  getEnrollment: async (userId: string, courseId: string): Promise<Enrollment | null> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/enrollments?userId=${userId}&courseId=${courseId}`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch enrollment');
    // }
    // const data = await response.json();
    // return data.length > 0 ? data[0] : null;

    // Temporary mock implementation
    const enrollment = mockEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );
    
    return enrollment ? enrollment as Enrollment : null;
  },

  // Lấy danh sách khóa học đã đăng ký của user
  getUserEnrollments: async (userId: string): Promise<Enrollment[]> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/enrollments?userId=${userId}`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch user enrollments');
    // }
    // return response.json();

    // Temporary mock implementation
    const enrollments = mockEnrollments.filter(e => e.userId === userId);
    return enrollments as Enrollment[];
  },

  // Cập nhật tiến độ học
  updateProgress: async (
    userId: string, 
    courseId: string, 
    progress: number
  ): Promise<Enrollment> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/enrollments/progress`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ userId, courseId, progress }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update progress');
    // }
    // return response.json();

    // Temporary mock implementation
    const enrollment = await enrollmentService.getEnrollment(userId, courseId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // In a real app, this would update the database
    // For now, we just return the updated enrollment
    return {
      ...enrollment,
      progress,
      status: progress >= 100 ? 'DONE' : 'INPROGESS',
      completedAt: progress >= 100 ? new Date() : null,
    };
  },

  // Đánh dấu khóa học hoàn thành
  markCourseComplete: async (userId: string, courseId: string, score?: number): Promise<Enrollment> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/enrollments/complete`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ userId, courseId, score }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to mark course as complete');
    // }
    // return response.json();

    // Temporary mock implementation
    const enrollment = await enrollmentService.getEnrollment(userId, courseId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // In a real app, this would update the database
    // For now, we just return the updated enrollment
    return {
      ...enrollment,
      progress: 100,
      status: 'DONE',
      score: score !== undefined ? score : enrollment.score,
      completedAt: new Date(),
    };
  },
}; 