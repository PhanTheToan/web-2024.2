import { mockReviews, mockUsers, mockCourses } from '@/data/mockData';

// Types for Review-related operations
interface Review {
  _id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const reviewService = {
  // Lấy đánh giá của một khóa học
  getCourseReviews: async (courseId: string): Promise<Review[]> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch course reviews');
    // }
    // return response.json();

    // Temporary mock implementation
    const reviews = mockReviews.filter(r => r.courseId === courseId);
    
    // Sort by newest first
    return [...reviews].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) as Review[];
  },

  // Thêm đánh giá mới cho khóa học
  addReview: async (
    userId: string, 
    courseId: string, 
    rating: number, 
    comment: string
  ): Promise<Review> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/reviews`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ userId, courseId, rating, comment }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to add review');
    // }
    // return response.json();

    // Temporary mock implementation
    // Validate data
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user and course exist
    const user = mockUsers.find(u => u._id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const course = mockCourses.find(c => c._id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user has already reviewed this course
    const existingReview = mockReviews.find(
      r => r.userId === userId && r.courseId === courseId
    );
    
    if (existingReview) {
      // In a real app, this would update the existing review
      // For now, we return an error
      throw new Error('You have already reviewed this course');
    }

    // Create new review
    const newReview = {
      _id: `review${mockReviews.length + 1}`,
      userId,
      courseId,
      rating,
      comment,
      createdAt: new Date(),
    };

    // In a real app, this would save to the database
    // For now, we just return the new review
    return newReview;
  },

  // Chỉnh sửa đánh giá
  updateReview: async (
    reviewId: string, 
    rating?: number, 
    comment?: string
  ): Promise<Review> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ rating, comment }),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to update review');
    // }
    // return response.json();

    // Temporary mock implementation
    const review = mockReviews.find(r => r._id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // In a real app, this would update the database
    // For now, we just return the updated review
    return {
      ...review,
      rating: rating !== undefined ? rating : review.rating,
      comment: comment !== undefined ? comment : review.comment,
    } as Review;
  },

  // Xóa đánh giá
  deleteReview: async (reviewId: string): Promise<{ success: boolean }> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to delete review');
    // }
    // return response.json();

    // Temporary mock implementation
    const review = mockReviews.find(r => r._id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // In a real app, this would delete from the database
    // For now, we just return success
    return { success: true };
  },

  // Tính rating trung bình của khóa học
  getAverageRating: async (courseId: string): Promise<number> => {
    // TODO: Implement API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/courses/${courseId}/rating`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch course rating');
    // }
    // const data = await response.json();
    // return data.averageRating;

    // Temporary mock implementation
    const reviews = await reviewService.getCourseReviews(courseId);
    
    if (reviews.length === 0) {
      return 0;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  },
}; 