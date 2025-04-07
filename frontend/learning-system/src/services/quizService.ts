import { mockQuizzes } from '@/data/mockData';
import { mockCourses } from '@/data/mockCourses';

// Types for Quiz-related operations
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  createdAt: Date;
}

interface QuizSubmission {
  quizId: string;
  userId: string;
  answers: Record<number, string>; // Index of question -> selected answer
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  feedback: {
    questionIndex: number;
    isCorrect: boolean;
    correctAnswer?: string;
  }[];
}

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const quizService = {
  // Lấy chi tiết một bài quiz
  getQuizById: async (id: string): Promise<Quiz> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/quizzes/${id}`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch quiz');
    // }
    // return response.json();

    // Temporary mock implementation
    const quiz = mockQuizzes.find(q => q._id === id);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    return quiz as Quiz;
  },

  // Lấy các bài quiz của một khóa học
  getQuizzesByCourseId: async (courseId: string): Promise<Quiz[]> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch quizzes');
    // }
    // return response.json();

    // Temporary mock implementation
    const course = mockCourses.find(c => c._id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // If the quizzes are just IDs, fetch the full quiz objects
    if (course.quizzes && Array.isArray(course.quizzes)) {
      if (course.quizzes.length > 0 && typeof course.quizzes[0] === 'string') {
        const quizIds = course.quizzes as string[];
        const quizzes = mockQuizzes.filter(quiz => quizIds.includes(quiz._id));
        return quizzes as Quiz[];
      }
    }

    return [];
  },

  // Nộp bài quiz và nhận kết quả
  submitQuiz: async (submission: QuizSubmission): Promise<QuizResult> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/quizzes/${submission.quizId}/submit`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(submission),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to submit quiz');
    // }
    // return response.json();

    // Temporary mock implementation - grading the quiz locally
    const quiz = await quizService.getQuizById(submission.quizId);
    let correctAnswers = 0;
    
    const feedback = quiz.questions.map((question, index) => {
      const userAnswer = submission.answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      return {
        questionIndex: index,
        isCorrect,
        correctAnswer: isCorrect ? undefined : question.correctAnswer
      };
    });
    
    const score = (correctAnswers / quiz.questions.length) * 100;
    
    return {
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      passed: score >= quiz.passingScore,
      feedback
    };
  },
  
  // Xóa một bài quiz
  deleteQuiz: async (courseId: string, quizId: string): Promise<{ success: boolean; message: string }> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/quizzes/${quizId}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to delete quiz');
    // }
    // return response.json();

    // Temporary mock implementation
    // Remove from mockQuizzes
    const quizIndex = mockQuizzes.findIndex(q => q._id === quizId);
    if (quizIndex !== -1) {
      mockQuizzes.splice(quizIndex, 1);
    }
    
    // Remove from course if it exists there
    const courseIndex = mockCourses.findIndex(c => c._id === courseId);
    if (courseIndex !== -1) {
      const course = mockCourses[courseIndex];
      if (Array.isArray(course.quizzes)) {
        if (course.quizzes.length > 0 && typeof course.quizzes[0] === 'object') {
          // if quizzes is an array of objects
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          course.quizzes = (course.quizzes as any[]).filter(q => q._id !== quizId);
        } else {
          // if quizzes is an array of IDs
          course.quizzes = (course.quizzes as string[]).filter(id => id !== quizId);
        }
      }
    }
    
    return { success: true, message: 'Quiz deleted successfully' };
  },
  
  // Tạo một bài quiz mới
  createQuiz: async (quizData: Omit<Quiz, '_id' | 'createdAt'> & { _id?: string }): Promise<Quiz> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/quizzes`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(quizData),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to create quiz');
    // }
    // return response.json();

    // Temporary mock implementation
    const newQuiz: Quiz = {
      _id: quizData._id || `quiz-${Date.now()}`,
      courseId: quizData.courseId,
      title: quizData.title,
      questions: quizData.questions,
      passingScore: quizData.passingScore,
      createdAt: new Date(),
      description: quizData.description,
      timeLimit: quizData.timeLimit
    };
    
    // In a real application, this would update the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockQuizzes.push(newQuiz as any);
    
    // Find the course and add the quiz to it if it exists
    const courseIndex = mockCourses.findIndex(c => c._id === quizData.courseId);
    if (courseIndex !== -1) {
      const course = mockCourses[courseIndex];
      if (Array.isArray(course.quizzes)) {
        if (course.quizzes.length > 0 && typeof course.quizzes[0] === 'object') {
          // if quizzes is an array of objects
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (course.quizzes as any[]).push(newQuiz);
        } else {
          // if quizzes is an array of IDs
          (course.quizzes as string[]).push(newQuiz._id);
        }
      } else {
        course.quizzes = [newQuiz._id];
      }
    }
    
    return newQuiz;
  },
  
  // Cập nhật một bài quiz
  updateQuiz: async (quizId: string, quizData: Partial<Quiz>): Promise<Quiz> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(quizData),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update quiz');
    // }
    // return response.json();

    // Temporary mock implementation
    const quizIndex = mockQuizzes.findIndex(q => q._id === quizId);
    if (quizIndex === -1) {
      throw new Error('Quiz not found');
    }
    
    const updatedQuiz = {
      ...mockQuizzes[quizIndex],
      ...quizData,
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockQuizzes[quizIndex] = updatedQuiz as any;
    return updatedQuiz as Quiz;
  }
}; 