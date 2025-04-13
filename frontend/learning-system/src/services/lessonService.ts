import { Lesson } from '@/app/types';
import { mockLessons } from '@/data/mockData';
import { mockCourses } from '@/data/mockCourses';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const lessonService = {
  // Lấy chi tiết một bài học
  getLessonById: async (id: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/lessons/${id}`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch lesson');
    // }
    // return response.json();

    // Temporary mock implementation
    // First, check in mockLessons
    const lesson = mockLessons.find(l => l._id === id);
    if (lesson) {
      return lesson;
    }

    // If not found, check if it might be a nested lesson in mockCourses
    for (const course of mockCourses) {
      const courseLessons = course.lessons;
      if (Array.isArray(courseLessons)) {
        const foundLesson = courseLessons.find((l: unknown) => {
          if (typeof l === 'object' && l !== null && '_id' in l) {
            return (l as { _id: string })._id === id;
          }
          return false;
        });
        if (foundLesson) {
          return foundLesson as Lesson;
        }
      }
    }

    throw new Error('Lesson not found');
  },

  // Lấy danh sách bài học của một khóa học
  getLessonsByCourseId: async (courseId: string) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch lessons');
    // }
    // return response.json();

    // Temporary mock implementation
    // Check in mockCourses first (already has full lesson objects)
    const course = mockCourses.find(c => c._id === courseId);
    if (course && Array.isArray(course.lessons) && course.lessons.length > 0) {
      if (typeof course.lessons[0] === 'object') {
        return course.lessons as Lesson[];
      }
    }

    // Else, filter lessons from mockLessons
    const lessons = mockLessons.filter(l => l.courseId === courseId);
    if (!lessons.length) {
      console.warn(`No lessons found for course ${courseId}`);
    }
    return lessons;
  },

  // Update lesson progress for a user
  updateLessonProgress: async (_lessonId: string, _progress: number) => {
    // Đánh dấu việc sử dụng tham số
    console.log(`Updating progress for lesson ${_lessonId} to ${_progress}%`);
    
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/progress`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ progress }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update lesson progress');
    // }
    // return response.json();

    // Temporary mock implementation
    return { success: true, message: 'Lesson progress updated' };
  },

  // Đánh dấu bài học đã hoàn thành
  markLessonComplete: async (_lessonId: string) => {
    // Đánh dấu việc sử dụng tham số
    console.log(`Marking lesson ${_lessonId} as complete`);
    
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete`, {
    //   method: 'POST',
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to mark lesson as complete');
    // }
    // return response.json();

    // Temporary mock implementation
    return { success: true, message: 'Lesson marked as complete' };
  },

  // Tạo bài học mới
  createLesson: async (lessonData: Omit<Lesson, '_id' | 'createdAt'> & { _id?: string }) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/lessons`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(lessonData),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to create lesson');
    // }
    // return response.json();

    // Ensure description is not undefined
    const description = lessonData.description || '';
    
    // Temporary mock implementation
    const newLesson: Omit<Lesson, 'description'> & { description: string } = {
      _id: lessonData._id || `lesson-${Date.now()}`,
      courseId: lessonData.courseId,
      title: lessonData.title,
      content: lessonData.content,
      videoUrl: lessonData.videoUrl || '',
      materials: lessonData.materials || [],
      order: lessonData.order || 1,
      timeLimit: lessonData.timeLimit || 30, // Default to 30 minutes if not provided
      createdAt: new Date(),
      description,
    };
    
    // In a real application, this would update the database
    mockLessons.push(newLesson);
    
    // Find the course and add the lesson to it if it exists
    const courseIndex = mockCourses.findIndex(c => c._id === lessonData.courseId);
    if (courseIndex !== -1) {
      // Get a reference to the course
      const course = mockCourses[courseIndex];
      
      // Add the lesson to the course's lessons array
      // We know from mockCourses.ts that lessons is a Lesson[] array
      // Safe to cast here as we've examined the actual implementation
      if (Array.isArray(course.lessons)) {
        // The typings in mockCourses.ts show that lessons is Lesson[]
        (course.lessons as unknown as Lesson[]).push(newLesson);
      }
    }
    
    return newLesson;
  },
  
  // Cập nhật bài học
  updateLesson: async (lessonId: string, lessonData: Partial<Lesson>) => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(lessonData),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update lesson');
    // }
    // return response.json();

    // Temporary mock implementation
    const lessonIndex = mockLessons.findIndex(l => l._id === lessonId);
    if (lessonIndex === -1) {
      // Check in courses if not found in mockLessons
      for (const course of mockCourses) {
        if (Array.isArray(course.lessons)) {
          // We know from mockCourses.ts that lessons is Lesson[]
          const courseLessons = course.lessons as unknown as Lesson[];
          const courseLessonIndex = courseLessons.findIndex(l => l._id === lessonId);
          
          if (courseLessonIndex !== -1) {
            const updatedLesson = {
              ...courseLessons[courseLessonIndex],
              ...lessonData,
            };
            
            courseLessons[courseLessonIndex] = updatedLesson;
            return updatedLesson;
          }
        }
      }
      throw new Error('Lesson not found');
    }
    
    const updatedLesson = {
      ...mockLessons[lessonIndex],
      ...lessonData,
    };
    
    mockLessons[lessonIndex] = updatedLesson;
    return updatedLesson;
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
    // Remove from mockLessons
    const lessonIndex = mockLessons.findIndex(l => l._id === lessonId);
    if (lessonIndex !== -1) {
      mockLessons.splice(lessonIndex, 1);
    }
    
    // Remove from course if it exists there
    const courseIndex = mockCourses.findIndex(c => c._id === courseId);
    if (courseIndex !== -1) {
      const course = mockCourses[courseIndex];
      if (Array.isArray(course.lessons)) {
        // We know from mockCourses.ts that lessons is Lesson[]
        course.lessons = (course.lessons as unknown as Lesson[]).filter(
          l => l._id !== lessonId
        );
      }
    }
    
    return { success: true, message: 'Lesson deleted successfully' };
  },
}; 