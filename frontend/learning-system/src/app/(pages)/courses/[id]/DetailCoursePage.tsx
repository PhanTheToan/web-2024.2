"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Course } from "@/app/types";
import { toast } from "react-hot-toast";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import CourseItem from '@/app/components/courseitem/courseItem';
import { BookOpen, Clock, Users, Star, CheckCircle, ClipboardCheck, PlayCircle, Lock, MessageSquare } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as dotenv from "dotenv";

dotenv.config();

// API Base URL
const API_BASE_URL = process.env.BASE_URL;

// Add interfaces for lesson and quiz responses
interface LessonResponse {
  lessonId: string;
  lessonTitle: string;
  lessonShortTitle?: string;
  orderLesson: number;
}

interface QuizResponse {
  quizId: string;
  title: string;
  questionCount: number;
  passingScore: number;
  orderQuiz: number;
}

// Extended Course interface with additional optional properties
interface ExtendedCourse extends Omit<Course, 'totalDuration'> {
  requirements?: string[];
  totalDuration?: number;
  averageRating?: number;
}

// Combined content item interface to handle both lessons and quizzes
interface ContentItem {
  _id: string;
  type: 'lesson' | 'quiz';
  title: string;
  description?: string;
  timeLimit?: number;
  order?: number;
  orderLesson?: number;
  orderQuiz?: number;
  lessonId?: string;
  quizId?: string;
  lessonTitle?: string;
  lessonShortTitle?: string;
  questionCount?: number;
  passingScore?: number;
  isCompleted?: boolean;
  currentlyLearning?: boolean;
}

// Last accessed content interface to track user's progress
interface LastAccessedContent {
  type: 'lesson' | 'quiz';
  id: string;
  title: string;
}

// Add this near the top of the file with the other interfaces
interface Review {
  _id: string;
  userId: string;
  userFullName?: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

const DetailCoursePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState<number>(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [lastAccessedContent, setLastAccessedContent] = useState<LastAccessedContent | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<{ rating: number; comment: string } | null>(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch course details
  const fetchCourse = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the API endpoint from first screenshot
      const courseResponse = await fetch(`${API_BASE_URL}/course/info/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course data');
      }

      const courseData = await courseResponse.json();
      console.log('Course data:', courseData);
      
      const parsedCourse = courseData.body || courseData;
      
      setCourse({
        ...parsedCourse,
        requirements: ['Basic programming knowledge', 'Understanding of web concepts'],
        averageRating: parsedCourse.averageRating || 4.5
      });

      // Try to check user authentication, but don't block if it fails
      let userIsEnrolled = false;
      try {
        userIsEnrolled = await checkUserAuth();
      } catch (authError) {
        console.error('Auth check failed, but continuing to show course content:', authError);
        setIsAuthenticated(false);
        setIsEnrolled(false);
      }
      
      // Load course content and pass the enrollment status
      await fetchCourseContent(userIsEnrolled);
      
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Không thể tải thông tin khóa học');
      toast.error('Không thể tải thông tin khóa học');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check user authentication
  const checkUserAuth = async () => {
    try {
      // Use the auth/check endpoint from third screenshot
      const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!authResponse.ok) {
        console.log('User is not authenticated');
        setIsAuthenticated(false);
        setIsEnrolled(false);
        return false;
      }

      const authData = await authResponse.json();
      console.log('Auth data:', authData);
      
      let userIsEnrolled = false;
      
      if (authData.status === 200 && authData.data) {
        setIsAuthenticated(true);
        
        // Check if user is enrolled in this course
        if (Array.isArray(authData.data.coursesEnrolled) && 
            authData.data.coursesEnrolled.includes(courseId)) {
          console.log('authData.data.coursesEnrolled:', authData.data.coursesEnrolled, courseId);
          userIsEnrolled = true;
          setIsEnrolled(true);
          setEnrollmentStatus('ENROLLED');
          setEnrollmentProgress(50); // Will be updated from content
        }
      }
      
      return userIsEnrolled;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      throw error; // Re-throw to be caught by caller
    }
  };
  
  // Fetch course content (lessons and quizzes)
  const fetchCourseContent = async (userIsEnrolled = false) => {
    setLoadingContent(true);
    try {
      // Use the current value passed in or the state value as a fallback
      const isUserEnrolled = userIsEnrolled || isEnrolled;
      console.log('fetchCourseContent - isUserEnrolled:', isUserEnrolled);
      
      // Use lesson-quiz (with hyphen) for enrolled users to get learned/not learned content
      // Use lesson_quiz (with underscore) for public/unauthenticated users
      const endpoint = isUserEnrolled 
        ? `${API_BASE_URL}/course/lesson-quiz/${courseId}`
        : `${API_BASE_URL}/course/lesson_quiz/${courseId}`;
      
      console.log('Using endpoint:', endpoint);
        
      const contentResponse = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to fetch course content');
      }

      const contentData = await contentResponse.json();
      console.log('Content data:', contentData);
      
      const combinedItems: ContentItem[] = [];
      
      // Check if we have a valid response with learned/notLearned sections
      if (contentData.body && contentData.body.notLearned) {
        // Process not learned lessons
        if (contentData.body.notLearned.lessons && Array.isArray(contentData.body.notLearned.lessons)) {
          contentData.body.notLearned.lessons.forEach((lesson: LessonResponse) => {
            combinedItems.push({
              _id: lesson.lessonId,
              type: 'lesson',
              title: lesson.lessonTitle || lesson.lessonShortTitle || 'Untitled Lesson',
              description: lesson.lessonShortTitle || '',
              orderLesson: lesson.orderLesson || 0,
              order: lesson.orderLesson || 0,
              isCompleted: false,
              currentlyLearning: false
            });
          });
        }
        
        // Process not learned quizzes
        if (contentData.body.notLearned.quizzes && Array.isArray(contentData.body.notLearned.quizzes)) {
          contentData.body.notLearned.quizzes.forEach((quiz: QuizResponse) => {
            combinedItems.push({
              _id: quiz.quizId,
              type: 'quiz',
              title: quiz.title || 'Untitled Quiz',
              questionCount: quiz.questionCount || 0,
              passingScore: quiz.passingScore || 70,
              orderQuiz: quiz.orderQuiz || 999,
              order: quiz.orderQuiz || 999,
              isCompleted: false,
              currentlyLearning: false
            });
          });
        }
      }
      
      // Add learned content
      if (contentData.body && contentData.body.learned) {
        // Process learned lessons
        if (contentData.body.learned.lessons && Array.isArray(contentData.body.learned.lessons)) {
          contentData.body.learned.lessons.forEach((lesson: LessonResponse) => {
            combinedItems.push({
              _id: lesson.lessonId,
              type: 'lesson',
              title: lesson.lessonTitle || lesson.lessonShortTitle || 'Untitled Lesson',
              description: lesson.lessonShortTitle || '',
              orderLesson: lesson.orderLesson || 0,
              order: lesson.orderLesson || 0,
              isCompleted: true,
              currentlyLearning: false
            });
          });
        }
        
        // Process learned quizzes
        if (contentData.body.learned.quizzes && Array.isArray(contentData.body.learned.quizzes)) {
          contentData.body.learned.quizzes.forEach((quiz: QuizResponse) => {
            combinedItems.push({
              _id: quiz.quizId,
              type: 'quiz',
              title: quiz.title || 'Untitled Quiz',
              questionCount: quiz.questionCount || 0,
              passingScore: quiz.passingScore || 70,
              orderQuiz: quiz.orderQuiz || 999,
              order: quiz.orderQuiz || 999,
              isCompleted: true,
              currentlyLearning: false
            });
          });
        }
      }
      
      // If we don't have the learned/notLearned format, fall back to the original format
      if (combinedItems.length === 0 && contentData.body) {
        // Process lessons
        if (contentData.body.lessons && Array.isArray(contentData.body.lessons)) {
          contentData.body.lessons.forEach((lesson: LessonResponse) => {
            combinedItems.push({
              _id: lesson.lessonId,
              type: 'lesson',
              title: lesson.lessonTitle || 'Untitled Lesson',
              description: lesson.lessonShortTitle || '',
              orderLesson: lesson.orderLesson || 0,
              order: lesson.orderLesson || 0,
              isCompleted: false,
              currentlyLearning: false
            });
          });
        }
        
        // Process quizzes
        if (contentData.body.quizzes && Array.isArray(contentData.body.quizzes)) {
          contentData.body.quizzes.forEach((quiz: QuizResponse) => {
            combinedItems.push({
              _id: quiz.quizId,
              type: 'quiz',
              title: quiz.title || 'Untitled Quiz',
              questionCount: quiz.questionCount || 0,
              passingScore: quiz.passingScore || 70,
              orderQuiz: quiz.orderQuiz || 999,
              order: quiz.orderQuiz || 999,
              isCompleted: false,
              currentlyLearning: false
            });
          });
        }
      }
      
      // Sort items by order
      combinedItems.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Mark the next unfinished item as "currently learning"
      if (isUserEnrolled) {
        // Find the first incomplete item
        const firstIncompleteIndex = combinedItems.findIndex(item => !item.isCompleted);
        
        if (firstIncompleteIndex !== -1) {
          // Mark this item as currently learning
          combinedItems[firstIncompleteIndex].currentlyLearning = true;
          
          // Set as last accessed content for navigation
          setLastAccessedContent({
            type: combinedItems[firstIncompleteIndex].type,
            id: combinedItems[firstIncompleteIndex]._id,
            title: combinedItems[firstIncompleteIndex].title
          });
        } else if (combinedItems.length > 0) {
          // If all items are complete, set the last one as "currently learning" for review
          const lastItem = combinedItems[combinedItems.length - 1];
          lastItem.currentlyLearning = true;
          
        setLastAccessedContent({
          type: lastItem.type,
          id: lastItem._id,
            title: lastItem.title
          });
        }
      }
      
      setContentItems(combinedItems);
      
      // Calculate enrollment progress based on completed items
      if (isUserEnrolled && combinedItems.length > 0) {
        const completedItems = combinedItems.filter(item => item.isCompleted);
        const progressPercentage = Math.round((completedItems.length / combinedItems.length) * 100);
        setEnrollmentProgress(progressPercentage);
        
        // Set enrollment status to DONE if all items are completed
        if (completedItems.length === combinedItems.length) {
          setEnrollmentStatus('DONE');
        }
      }
      
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.error('Không thể tải nội dung khóa học');
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  // Add safety check for courseId
  const ensureCourseId = (): string => {
    // Use params.id (which is extracted from the URL) if it exists
    if (typeof params.id === 'string') {
      return params.id;
    }
    
    // Fallback to course._id or course.id if available
    if (course?._id) {
      return course._id;
    }
    
    if (course?.id) {
      return course.id;
    }
    
    // Last resort, parse from URL directly
    const pathParts = window.location.pathname.split('/');
    const idFromPath = pathParts[pathParts.indexOf('courses') + 1];
    if (idFromPath) {
      return idFromPath;
    }
    
    console.error('Could not determine course ID');
    return '';
  };

  const handleEnroll = async () => {
    if (!course) return;
    
    const safeCourseId = ensureCourseId();
    
    if (!isAuthenticated) {
      // Redirect to login page if user is not authenticated
      toast.error('Bạn cần đăng nhập để đăng ký khóa học');
      router.push('/auth/login?redirect=' + encodeURIComponent(`/courses/${safeCourseId}`));
      return;
    }
    
    // Check if user is already enrolled via auth/check
    try {
      // Get fresh authentication data
      const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!authResponse.ok) {
        throw new Error('Authentication check failed');
      }

      const authData = await authResponse.json();
      
      // If user is already enrolled, just update UI state
      if (authData.status === 200 && 
          authData.data && 
          Array.isArray(authData.data.coursesEnrolled) && 
          authData.data.coursesEnrolled.includes(safeCourseId)) {
        setIsEnrolled(true);
        setEnrollmentStatus('ENROLLED');
        setEnrollmentProgress(0);
        toast.success('Bạn đã đăng ký khóa học này!');
        
        // Refresh content to get progress information
        await fetchCourseContent();
        return;
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
    
    // Not enrolled, proceed with enrollment
    setIsEnrolling(true);
    try {
      // Call the enrollment API
      const enrollResponse = await fetch(`${API_BASE_URL}/course/enroll`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: course._id || course.id || safeCourseId
        })
      });
      
      if (!enrollResponse.ok) {
        throw new Error('Failed to enroll in course');
      }
      
      // Update local state
      setIsEnrolled(true);
      setEnrollmentStatus('ENROLLED');
      setEnrollmentProgress(0);
      toast.success('Đăng ký khóa học thành công!');
      
      // Refresh data to get updated enrollment info
      await checkUserAuth();
      await fetchCourseContent();
    } catch (err) {
      console.error('Enrollment error:', err);
      toast.error('Không thể đăng ký khóa học. Vui lòng thử lại sau.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const getFirstLessonUrl = () => {
    if (!contentItems || contentItems.length === 0) {
      return null;
    }
    
    const firstItem = contentItems[0];
    const safeCourseId = ensureCourseId();
    return `/courses/${safeCourseId}/${firstItem.type}/${firstItem._id}`;
  };
  
  const getContinueLearningUrl = () => {
    if (!lastAccessedContent) {
      return getFirstLessonUrl();
    }
    
    const safeCourseId = ensureCourseId();
    return `/courses/${safeCourseId}/${lastAccessedContent.type}/${lastAccessedContent.id}`;
  };

  // Add a helper function to calculate the number of completed items
  const getCompletedItemCount = (totalItems: number, progressPercentage: number): number => {
    return Math.floor((progressPercentage / 100) * totalItems);
  };

  // Add a function to determine if a content item is accessible
  const isContentItemAccessible = (
    item: ContentItem, 
    index: number, 
    contentItems: ContentItem[], 
    isEnrolled: boolean,
    completedItemsCount: number,
    lastAccessedContent: LastAccessedContent | null
  ): boolean => {
    // If user is not enrolled, no items are accessible
    if (!isEnrolled) return false;
    
    // If item is already marked as completed, it's accessible
    if (item.isCompleted) return true;
    
    // First item is always accessible to enrolled users
    if (index === 0) return true;
    
    // Completed items are always accessible
    const isCompleted = index < completedItemsCount;
    if (isCompleted) return true;
    
    // Currently accessed item is accessible
    if (lastAccessedContent && lastAccessedContent.id === item._id) return true;
    
    // Check if all previous items are completed
    const allPreviousItemsCompleted = contentItems
      .slice(0, index)
      .every(prevItem => prevItem.isCompleted);
    
    return allPreviousItemsCompleted;
  };

  // Add new effect to fetch course reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!courseId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/course/review/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.body && Array.isArray(data.body)) {
            setReviews(data.body);
            
            // Check if the authenticated user has already reviewed the course
            if (isAuthenticated) {
              const userId = localStorage.getItem('userId');
              if (userId) {
                const userReviewData = data.body.find((review: Review) => review.userId === userId);
                if (userReviewData) {
                  setUserHasReviewed(true);
                  setUserReview({
                    rating: userReviewData.rating,
                    comment: userReviewData.comment
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    
    fetchReviews();
  }, [courseId, isAuthenticated]);

  // Add function to submit a review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để đánh giá khóa học');
      return;
    }
    
    if (!isEnrolled) {
      toast.error('Bạn cần đăng ký khóa học để đánh giá');
      return;
    }
    
    if (enrollmentProgress < 100) {
      toast.error('Bạn cần hoàn thành khóa học để đánh giá');
      return;
    }
    
    if (userHasReviewed) {
      toast.error('Bạn đã đánh giá khóa học này');
      return;
    }
    
    setSubmittingReview(true);
    setReviewError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/course/review`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserHasReviewed(true);
        setUserReview({
          rating: reviewRating,
          comment: reviewComment
        });
        
        // Add the new review to the list
        setReviews([
          {
            _id: data.body._id || Date.now().toString(),
            userId: localStorage.getItem('userId') || 'anonymous',
            courseId: courseId,
            rating: reviewRating,
            comment: reviewComment,
            createdAt: new Date().toISOString()
          },
          ...reviews
        ]);
        
        toast.success('Đánh giá khóa học thành công!');
        setReviewComment('');
      } else {
        const errorData = await response.json();
        setReviewError(errorData.message || 'Không thể đánh giá khóa học');
        toast.error('Không thể đánh giá khóa học');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('Đã xảy ra lỗi khi gửi đánh giá');
      toast.error('Đã xảy ra lỗi khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Không tìm thấy khóa học
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <BreadcrumbContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseItem course={course as Course} />
        
        {/* Call to Action Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {isEnrolled 
                ? 'Tiếp tục hành trình học tập của bạn!' 
                : 'Bắt đầu hành trình học tập của bạn ngay hôm nay!'}
            </h3>
            <p className="text-gray-600">
              {isEnrolled 
                ? lastAccessedContent 
                  ? `Tiếp tục học: ${lastAccessedContent.title}` 
                  : 'Tiếp tục khóa học của bạn từ đúng nơi bạn đã dừng lại.'
                : isAuthenticated
                  ? 'Đăng ký khóa học này để truy cập vào toàn bộ nội dung.'
                  : 'Đăng nhập và đăng ký khóa học để truy cập vào toàn bộ nội dung.'}
            </p>
          </div>
          
          {!isEnrolled ? (
            <button 
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="mt-4 md:mt-0 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-70"
            >
              {isEnrolling 
                ? 'Đang đăng ký...' 
                : isAuthenticated 
                  ? 'Đăng ký khóa học' 
                  : 'Đăng nhập để đăng ký'}
            </button>
          ) : (
            <div className="mt-4 md:mt-0 flex flex-col items-center">
              {enrollmentStatus === 'DONE' ? (
                <div className="text-green-600 font-semibold mb-2">Đã hoàn thành khóa học!</div>
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${enrollmentProgress}%` }}
                  ></div>
                </div>
              )}
              <Link 
                href={getContinueLearningUrl() || '#'} 
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                {enrollmentStatus === 'DONE' 
                  ? 'Xem lại khóa học' 
                  : enrollmentProgress > 0 
                    ? 'Tiếp tục học' 
                    : 'Bắt đầu học'}
              </Link>
            </div>
          )}
        </div>
        
        {/* Course Information Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Mô tả khóa học</h2>
              <p className="text-gray-600">{course.description}</p>
            </div>

            {/* Course content - unified list */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
              
              {loadingContent ? (
                <div className="p-4 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ) : contentItems.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  Khóa học chưa có nội dung
                </div>
              ) : (
                <div className="space-y-3">
                  {contentItems.map((item, index) => {
                    // Use the item's isCompleted property directly
                    const isCompleted = item.isCompleted || false;
                    const isCurrentlyLearning = item.currentlyLearning || false;
                    const isAccessible = isContentItemAccessible(
                      item,
                      index,
                      contentItems,
                      isEnrolled,
                      getCompletedItemCount(contentItems.length, enrollmentProgress),
                      lastAccessedContent
                    );
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center p-4 rounded-lg border ${
                          isEnrolled && isAccessible
                            ? isCurrentlyLearning 
                              ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                              : 'hover:bg-gray-50 cursor-pointer' 
                            : 'bg-gray-50 cursor-not-allowed opacity-70'
                        }`}
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.error('Bạn cần đăng nhập để truy cập nội dung');
                            router.push('/auth/login?redirect=' + encodeURIComponent(`/courses/${courseId}`));
                            return;
                          }
                          
                          if (!isEnrolled) {
                            toast.error('Bạn cần đăng ký khóa học để truy cập nội dung');
                            return;
                          }
                          
                          if (!isAccessible) {
                            toast.error('Bạn cần hoàn thành các nội dung trước để mở khóa nội dung này');
                            return;
                          }
                          
                          if (item.type === 'lesson') {
                            router.push(`/courses/${ensureCourseId()}/lesson/${item._id}`);
                          } else {
                            router.push(`/courses/${ensureCourseId()}/quiz/${item._id}`);
                          }
                        }}
                      >
                        <div className="mr-4">
                          {item.type === 'lesson' ? (
                            <BookOpen className="w-6 h-6 text-primary-600" />
                          ) : (
                            <ClipboardCheck className="w-6 h-6 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.type === 'lesson' ? (
                            <p className="text-sm text-gray-500">{item.description || 'Nội dung bài học'}</p>
                          ) : (
                            <p className="text-sm text-gray-500">
                              {item.questionCount || 0} câu hỏi • Điểm đạt: {item.passingScore || 70}%
                            </p>
                          )}
                        </div>
                        
                        {!isAuthenticated && (
                          <div className="ml-4 text-sm text-red-600">
                            Cần đăng nhập
                          </div>
                        )}
                        
                        {isAuthenticated && !isEnrolled && (
                          <div className="ml-4 text-sm text-red-600">
                            Cần đăng ký
                          </div>
                        )}
                        
                        {/* Show item status */}
                        {isEnrolled && (
                          <>
                            {isCompleted && (
                              <div className="ml-4 text-sm text-green-600 bg-green-50 px-2 py-1 rounded flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Đã hoàn thành
                              </div>
                            )}
                            
                            {isCurrentlyLearning && !isCompleted && (
                              <div className="ml-4 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center">
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Đang học
                              </div>
                            )}
                            
                            {isEnrolled && !isAccessible && !isCompleted && !isCurrentlyLearning && (
                              <div className="ml-4 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center">
                                <Lock className="w-4 h-4 mr-1" />
                                Chưa mở khóa
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reviews section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <MessageSquare className="mr-2" size={24} />
                Đánh giá khóa học
              </h2>
              
              {/* Review Form */}
              {isAuthenticated && isEnrolled && enrollmentProgress >= 100 && !userHasReviewed && (
                <div className="mb-8 border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Để lại đánh giá của bạn</h3>
                  
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Đánh giá của bạn</label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="mr-1 focus:outline-none"
                            onClick={() => setReviewRating(star)}
                          >
                            <Star
                              size={24}
                              className={star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-gray-600">{reviewRating}/5</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="review-comment" className="block text-gray-700 mb-2">
                        Nhận xét của bạn
                      </label>
                      <textarea
                        id="review-comment"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    
                    {reviewError && (
                      <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-lg">
                        {reviewError}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                </div>
              )}
              
              {isAuthenticated && isEnrolled && enrollmentProgress >= 100 && userHasReviewed && (
                <div className="mb-8 border rounded-lg p-4 bg-green-50">
                  <h3 className="text-lg font-semibold mb-2 text-green-700 flex items-center">
                    <CheckCircle className="mr-2" size={20} />
                    Bạn đã đánh giá khóa học này
                  </h3>
                  
                  {userReview && (
                    <div className="mt-2">
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={star <= userReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                        <span className="ml-2 text-gray-700">{userReview.rating}/5</span>
                      </div>
                      <p className="text-gray-700">{userReview.comment}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Display message for unenrolled or incomplete course */}
              {isAuthenticated && (!isEnrolled || enrollmentProgress < 100) && (
                <div className="mb-8 border rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-700">
                    {!isEnrolled 
                      ? 'Bạn cần đăng ký khóa học để đánh giá' 
                      : 'Bạn cần hoàn thành khóa học (100%) để đánh giá'}
                  </p>
                </div>
              )}
              
              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Tất cả đánh giá ({reviews.length})
                </h3>
                
                {reviews.length === 0 ? (
                  <p className="text-gray-500 italic py-4">Chưa có đánh giá nào cho khóa học này</p>
                ) : (
                  <div className="space-y-4 mt-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold mr-3">
                            {review.userFullName ? review.userFullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold">{review.userFullName || 'Người dùng'}</div>
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={16}
                                    className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 ml-13">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Thông tin khóa học</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="text-orange-500 mr-3" />
                  <span>Thời lượng: {course.totalDuration || course.totalTimeLimit || 0} mins</span>
                </div>
                <div className="flex items-center">
                  <Users className="text-orange-500 mr-3" />
                  <span>{course.studentsCount || 0} học viên</span>
                </div>
                <div className="flex items-center">
                  <Star className="text-orange-500 mr-3" />
                  <span>Đánh giá: {course.averageRating || 0}/5</span>
                </div>
              </div>
            </div>

           
            
            {/* Progress section for enrolled users */}
            {isEnrolled && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Tiến độ của bạn</h3>
                <div className="flex items-center justify-between mb-2">
                  <span>Hoàn thành:</span>
                  <span className="font-semibold">{enrollmentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${enrollmentProgress}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <Link
                    href={getContinueLearningUrl() || '#'}
                    className="inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                  >
                    {enrollmentStatus === 'DONE' 
                      ? 'Xem lại khóa học' 
                      : enrollmentProgress > 0 
                        ? 'Tiếp tục học' 
                        : 'Bắt đầu học'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    );
};

export default DetailCoursePage;