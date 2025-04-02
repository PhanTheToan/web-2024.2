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
        const foundLesson = courseLessons.find((l: Lesson) => l._id === id);
        if (foundLesson) {
          return foundLesson;
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

  // Cập nhật tiến độ học của một bài học
  updateLessonProgress: async (_lessonId: string, _progress: number) => {
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
    return { success: true, message: 'Progress updated successfully' };
  },

  // Đánh dấu bài học đã hoàn thành
  markLessonComplete: async (_lessonId: string) => {
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
}; 