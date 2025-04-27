"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Course } from "@/app/types";
import { toast } from "react-hot-toast";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import CourseItem from '@/app/components/courseitem/courseItem';
import { BookOpen, Clock, Users, Star, CheckCircle, ClipboardCheck, PlayCircle, Lock, MessageSquare, Trash } from 'lucide-react';
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
  title?: string;  // Make title optional since it might be missing in lesson-quiz endpoint
  name?: string;   // Add name as an alternative field that might be used
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
  _id?: string;
  id?: string;
  userId?: string;
  userFullName?: string;
  fullName?: string;
  courseId?: string;
  rate?: number;
  rating?: number;
  comment: string;
  createdAt?: string | Date;
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
  const [userReview, setUserReview] = useState<{ rate: number; rating: number; comment: string } | null>(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Add state for confirmation modal
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      
      // Log the categories for debugging
      console.log('Course categories:', parsedCourse.categories);
      
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
        setIsAdmin(false);
        return false;
      }

      const authData = await authResponse.json();
      console.log('Full Auth data response:', JSON.stringify(authData, null, 2));
      
      let userIsEnrolled = false;
      
      if (authData.status === 200 && authData.data) {
        setIsAuthenticated(true);
        
        // More robust admin role check
        const userData = authData.data;
        const userRole = userData.role;
        const userRoles = userData.roles || [];
        
        console.log('User role(s):', { 
          directRole: userRole, 
          rolesArray: userRoles,
          isAdmin: userRole === 'ROLE_ADMIN' || userRoles.includes('ROLE_ADMIN') || userRoles.includes('ADMIN')
        });
        
        // Check multiple possible admin role formats
        if (
          userRole === 'ROLE_ADMIN' || 
          userRole === 'ADMIN' || 
          (Array.isArray(userRoles) && (
            userRoles.includes('ROLE_ADMIN') || 
            userRoles.includes('ADMIN')
          ))
        ) {
          setIsAdmin(true);
          console.log('✅ User is admin - enabled special features');
          
          // Store admin status in localStorage for persistence
          localStorage.setItem('isAdmin', 'true');
        } else {
          console.log('User is not admin, detected role(s):', userRole, userRoles);
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
        }
        
        // Save user information to localStorage for reviews
        if (userData._id) {
          localStorage.setItem('userId', userData._id);
        }
        
        // Construct and save full name
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        if (fullName) {
          localStorage.setItem('userFullName', fullName);
        }
        
        // Check if user is enrolled in this course
        if (Array.isArray(userData.coursesEnrolled) && 
            userData.coursesEnrolled.includes(courseId)) {
          console.log('authData.data.coursesEnrolled:', userData.coursesEnrolled, courseId);
          userIsEnrolled = true;
          setIsEnrolled(true);
          setEnrollmentStatus('ENROLLED');
          setEnrollmentProgress(50); // Will be updated from content
          setIsPendingApproval(false);
        } else {
          // Check if the course is in the requestCourse array (pending approval)
          if (Array.isArray(userData.requestCourse) && 
              userData.requestCourse.includes(courseId)) {
            console.log('Course found in requestCourse array, setting pending approval');
            setIsPendingApproval(true);
            setIsEnrolled(false);
          } else {
            setIsPendingApproval(false);
            
            // Check if there is a pending approval record in localStorage
            const pendingApprovals = JSON.parse(localStorage.getItem('pendingCourseApprovals') || '[]');
            if (Array.isArray(pendingApprovals) && pendingApprovals.includes(courseId)) {
              setIsPendingApproval(true);
              console.log('Found pending approval for course in localStorage:', courseId);
            }
          }
        }
      }
      
      return userIsEnrolled;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
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
      
      // First, get quiz data from lesson_quiz (with underscore) to ensure we have quiz titles
      const quizTitlesMap = new Map<string, string>();
      
      try {
        const quizDataResponse = await fetch(`${API_BASE_URL}/course/lesson_quiz/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (quizDataResponse.ok) {
          const quizData = await quizDataResponse.json();
          console.log('Quiz data for titles:', quizData);
          
          // Extract quiz titles and store them by ID
          if (quizData.body && quizData.body.quizzes && Array.isArray(quizData.body.quizzes)) {
            quizData.body.quizzes.forEach((quiz: QuizResponse) => {
              if (quiz.quizId && (quiz.title || quiz.name)) {
                quizTitlesMap.set(quiz.quizId, quiz.title || quiz.name || '');
                console.log(`Stored quiz title: ${quiz.quizId} -> ${quiz.title || quiz.name}`);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching quiz titles:', error);
      }
      
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
            // Try to get title from our titles map, or from the response, or use a default
            const quizTitle = quizTitlesMap.get(quiz.quizId) || quiz.title || quiz.name || `Quiz ${quiz.orderQuiz || ''}`;
            
            combinedItems.push({
              _id: quiz.quizId,
              type: 'quiz',
              title: quizTitle,
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
            // Try to get title from our titles map, or from the response, or use a default
            const quizTitle = quizTitlesMap.get(quiz.quizId) || quiz.title || quiz.name || `Quiz ${quiz.orderQuiz || ''}`;
            
            combinedItems.push({
              _id: quiz.quizId,
              type: 'quiz',
              title: quizTitle,
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
            // Try to get title from our titles map, or from the response, or use a default
            const quizTitle = quizTitlesMap.get(quiz.quizId) || quiz.title || quiz.name || `Quiz ${quiz.orderQuiz || ''}`;
            
            combinedItems.push({
              _id: quiz.quizId,
              type: 'quiz',
              title: quizTitle,
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

  // Add a dedicated function to check enrollment status
  const checkEnrollmentStatus = async () => {
    if (!isAuthenticated) return false;
    
    const safeCourseId = ensureCourseId();
    
    try {
      const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!authResponse.ok) {
        setIsAuthenticated(false);
        setIsEnrolled(false);
        setIsPendingApproval(false);
        return false;
      }

      const authData = await authResponse.json();
      
      if (authData.status === 200 && authData.data) {
        setIsAuthenticated(true);
        
        // Check if user is enrolled in this course
        if (Array.isArray(authData.data.coursesEnrolled) && 
            authData.data.coursesEnrolled.includes(safeCourseId)) {
          console.log('User is enrolled in course:', safeCourseId);
          setIsEnrolled(true);
          setIsPendingApproval(false);
          setEnrollmentStatus('ENROLLED');
          
          // Remove from pending approvals in localStorage if it exists
          try {
            const pendingApprovals = JSON.parse(localStorage.getItem('pendingCourseApprovals') || '[]');
            if (pendingApprovals.includes(safeCourseId)) {
              const updatedApprovals = pendingApprovals.filter((id: string) => id !== safeCourseId);
              localStorage.setItem('pendingCourseApprovals', JSON.stringify(updatedApprovals));
              console.log('Removed course from pending approvals:', safeCourseId);
            }
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
          
          // Fetch course content to get progress
          await fetchCourseContent(true);
          return true;
        } else {
          console.log('User is not enrolled in course:', safeCourseId);
          setIsEnrolled(false);
          
          // Check if course is in requestCourse array
          if (Array.isArray(authData.data.requestCourse) && 
              authData.data.requestCourse.includes(safeCourseId)) {
            console.log('Course is in requestCourse array (pending approval):', safeCourseId);
            setIsPendingApproval(true);
          } else {
            // Course not in requestCourse array, check localStorage
            try {
              const pendingApprovals = JSON.parse(localStorage.getItem('pendingCourseApprovals') || '[]');
              if (pendingApprovals.includes(safeCourseId)) {
                console.log('Course found in localStorage pending approvals:', safeCourseId);
                setIsPendingApproval(true);
              } else {
                setIsPendingApproval(false);
              }
            } catch (e) {
              console.error('Error checking localStorage for pending approvals:', e);
              setIsPendingApproval(false);
            }
          }
          
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCourse();
    
    // Check for admin status in localStorage
    const storedAdminStatus = localStorage.getItem('isAdmin');
    if (storedAdminStatus === 'true') {
      console.log('Found admin status in localStorage');
      setIsAdmin(true);
    }
    
    // Set up a periodic check for enrollment status if pending approval
    let statusCheckInterval: NodeJS.Timeout | null = null;
    
    if (isPendingApproval) {
      statusCheckInterval = setInterval(() => {
        checkEnrollmentStatus().then(isEnrolled => {
          if (isEnrolled) {
            // User is now enrolled, clear the interval
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval);
            }
            toast.success('Yêu cầu đăng ký của bạn đã được phê duyệt!');
          }
        });
      }, 30000); // Check every 30 seconds
    }
    
    // Clean up interval on component unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [courseId, isPendingApproval]);

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
    
    // Reset pending approval status
    setIsPendingApproval(false);
    
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
      // Check course categories to determine the HTTP method
      // Use PUT for PRIVATE courses, POST for PUBLIC or undefined category
      const isPrivateCourse = course.categories && 
                            Array.isArray(course.categories) && 
                            course.categories.includes("PRIVATE");
      
      const method = isPrivateCourse ? 'PUT' : 'POST';
      console.log(`Enrolling in course: ${safeCourseId} using ${method} method (isPrivate: ${isPrivateCourse})`);
      
      const enrollResponse = await fetch(`${API_BASE_URL}/enrollments/${safeCourseId}`, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!enrollResponse.ok) {
        throw new Error('Failed to enroll in course');
      }
      
      // Simple text response as shown in the screenshot
      const responseText = await enrollResponse.text();
      console.log('Enrollment response:', responseText);
      
      // For private courses, check if the enrollment has been approved immediately
      if (isPrivateCourse) {
        // Do another auth check to see if the course is actually in enrolledCourses
        try {
          const postEnrollAuthCheck = await fetch(`${API_BASE_URL}/auth/check`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (postEnrollAuthCheck.ok) {
            const authData = await postEnrollAuthCheck.json();
            
            if (authData.status === 200 && authData.data) {
              if (Array.isArray(authData.data.coursesEnrolled) && 
                  authData.data.coursesEnrolled.includes(safeCourseId)) {
                // Enrollment approved immediately
                setIsEnrolled(true);
                setEnrollmentStatus('ENROLLED');
                setEnrollmentProgress(0);
                setIsPendingApproval(false);
                toast.success('Đăng ký khóa học thành công!');
                await fetchCourseContent(true);
              } else if (Array.isArray(authData.data.requestCourse) && 
                         authData.data.requestCourse.includes(safeCourseId)) {
                // Course is in the requestCourse array - pending approval
                setIsPendingApproval(true);
                setIsEnrolled(false);
                
                // No need to save to localStorage since we can check the requestCourse array
                toast.success('Yêu cầu đăng ký khóa học đã được gửi và đang chờ phê duyệt!');
              } else {
                // Course is not in either array, save pending approval to localStorage
                setIsPendingApproval(true);
                
                // Save pending approval status to localStorage
                const pendingApprovals = JSON.parse(localStorage.getItem('pendingCourseApprovals') || '[]');
                if (!pendingApprovals.includes(safeCourseId)) {
                  pendingApprovals.push(safeCourseId);
                  localStorage.setItem('pendingCourseApprovals', JSON.stringify(pendingApprovals));
                }
                
                toast.success('Yêu cầu đăng ký khóa học đã được gửi và đang chờ phê duyệt!');
              }
            }
          }
        } catch (error) {
          console.error('Error checking enrollment status after enrollment:', error);
          // Still show pending approval message if check fails
          setIsPendingApproval(true);
          
          // Save pending approval status to localStorage
          const pendingApprovals = JSON.parse(localStorage.getItem('pendingCourseApprovals') || '[]');
          if (!pendingApprovals.includes(safeCourseId)) {
            pendingApprovals.push(safeCourseId);
            localStorage.setItem('pendingCourseApprovals', JSON.stringify(pendingApprovals));
          }
          
          toast.success('Yêu cầu đăng ký khóa học đã được gửi và đang chờ phê duyệt!');
        }
      } else {
        // For public courses, consider it immediate enrollment
        if (responseText.includes('success')) {
          // Update local state for immediate access
          setIsEnrolled(true);
          setEnrollmentStatus('ENROLLED');
          setEnrollmentProgress(0);
          toast.success('Đăng ký khóa học thành công!');
          
          // Refresh data to get updated enrollment info
          await checkUserAuth();
          await fetchCourseContent(true);
          await fetchReviews(); // Also fetch reviews to check if user has reviewed
        } else {
          // If unexpected response, still consider it a success but inform user
          toast.success('Yêu cầu đăng ký khóa học đã được gửi!');
        }
      }
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

  // Add fetchReviews as a memoized callback
  const fetchReviews = useCallback(async () => {
    if (!courseId) return;
    
    try {
      // Update to use the correct API endpoint from the screenshot
      const response = await fetch(`${API_BASE_URL}/reviews/per/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Reviews data:', data);
        
        // Process reviews from the response format shown in the screenshot
        if (data.body && Array.isArray(data.body)) {
          // Map the response to our Review interface
          const processedReviews = data.body.map((review: {
            id?: string;
            fullName?: string;
            rating?: number;
            comment?: string;
          }) => ({
            id: review.id || '',
            _id: review.id || '', // Keep _id for compatibility
            fullName: review.fullName || 'Unknown Users',
            userFullName: review.fullName || 'Unknown Users',
            rating: review.rating || 0,
            rate: review.rating || 0, // Keep rate for compatibility
            comment: review.comment || '',
            createdAt: new Date().toISOString() // Default to current date if not provided
          }));
          
          setReviews(processedReviews);
          
          // Since there's no userId in the reviews, try to find our review by matching fullName
          if (isAuthenticated) {
            const userFullName = localStorage.getItem('userFullName');
            // Only for display purposes, not for validation
            if (userFullName) {
              const maybeMyReview = processedReviews.find(
                (review: Review) => review.fullName === userFullName
              );
              
              if (maybeMyReview) {
                console.log('Potential user review found (by name match):', maybeMyReview);
                // This is just to display the review, not to validate if user can submit
                setUserReview({
                  rate: maybeMyReview.rate || 0,
                  rating: maybeMyReview.rating || 0,
                  comment: maybeMyReview.comment
                });
              }
            }
          }
        } else {
          console.log('No reviews found or invalid response format');
          setReviews([]);
        }
      } else {
        console.error('Failed to fetch reviews:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [courseId, isAuthenticated]);
  
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
    
    // Validate the review content based on screenshot format fields
    if (!reviewComment.trim()) {
      setReviewError('Vui lòng nhập nhận xét của bạn');
      toast.error('Vui lòng nhập nhận xét của bạn');
      return;
    }
    
    // Validate that rate is between 1-5
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Đánh giá phải từ 1 đến 5 sao');
      toast.error('Đánh giá phải từ 1 đến 5 sao');
      return;
    }
    
    // Validate courseId
    if (!courseId) {
      setReviewError('Không thể xác định ID khóa học');
      toast.error('Không thể xác định ID khóa học');
      return;
    }
    
    setSubmittingReview(true);
    setReviewError(null);
    
    try {
      // Update to use the exact format shown in the screenshot
      const reviewData = {
        courseId: courseId,
        comment: reviewComment,
        rate: reviewRating
      };
      
      console.log('Submitting review with exact format from screenshot:', reviewData);
      
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      console.log('Review submission response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Review submission response:', data);
        
        // Check if the response contains the "already reviewed" message
        const responseText = JSON.stringify(data);
        if (responseText.includes('Bạn chỉ được đánh giá một lần!')) {
          // User has already reviewed this course
          console.log('User already reviewed this course');
          setUserHasReviewed(true);
          setReviewError('Bạn chỉ được đánh giá một lần!');
          toast.error('Bạn chỉ được đánh giá một lần!');
          
          // Fetch updated reviews
          fetchReviews();
        } else {
          // Successfully submitted review
          setUserHasReviewed(true);
          setUserReview({
            rate: reviewRating,
            rating: reviewRating,
            comment: reviewComment
          });
          
          // Fetch the updated reviews to get the proper format from the server
          fetchReviews();
          
          toast.success('Đánh giá khóa học thành công!');
          setReviewComment('');
        }
      } else {
        const errorText = await response.text();
        console.error('Review submission failed:', errorText, 'Status:', response.status);
        
        // Try to parse error message for other errors
        try {
          const errorData = JSON.parse(errorText);
          
          // Check for specific field errors based on screenshot format
          if (errorData.message && errorData.message.includes('courseId')) {
            setReviewError('ID khóa học không hợp lệ.');
          } else if (errorData.message && errorData.message.includes('comment')) {
            setReviewError('Vui lòng nhập nhận xét.');
          } else if (errorData.message && errorData.message.includes('rate')) {
            setReviewError('Đánh giá không hợp lệ. Vui lòng chọn từ 1-5 sao.');
          } else {
            setReviewError(errorData.message || 'Không thể đánh giá khóa học');
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
          setReviewError('Không thể đánh giá khóa học: ' + errorText);
        }
        
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

  // Handle initiating review deletion (shows confirmation modal)
  const handleInitiateDeleteReview = (reviewId: string) => {
    console.log('Initiating delete for review:', reviewId);
    
    if (!isAdmin) {
      toast.error('Chỉ quản trị viên mới có thể xóa đánh giá');
      return;
    }
    
    // Set the review ID to delete and show confirmation modal
    setReviewToDelete(reviewId);
    setShowDeleteConfirmation(true);
  };
  
  // Handle actual review deletion after confirmation
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    setIsDeleting(true);
    try {
      // Updated to use query parameter format ?id=reviewId as shown in the API screenshot
      const deleteUrl = `${API_BASE_URL}/reviews?id=${reviewToDelete}`;
      console.log('Sending delete request to:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        // Show success toast with longer duration and more prominent style
        toast.success('Đã xóa đánh giá thành công!', {
          duration: 5000,
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '8px',
          },
          icon: '🗑️'
        });
        
        // Refresh the reviews list
        fetchReviews();
      } else {
        const errorText = await response.text();
        console.error('Failed to delete review:', errorText);
        toast.error('Không thể xóa đánh giá');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Đã xảy ra lỗi khi xóa đánh giá');
    } finally {
      // Reset modal state
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setReviewToDelete(null);
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
        
        {/* Only show admin-related UI if user is an admin */}
        {isAdmin && (
          <>
            {/* Admin mode indicator */}
            <div className="bg-red-600 text-white py-1 px-4 text-center font-medium">
              <div className="max-w-7xl mx-auto flex items-center justify-center">
                <Trash className="mr-2" size={16} />
                Bạn đang ở chế độ quản trị viên - Có thể xóa đánh giá
              </div>
            </div>
            
            {/* Debug admin mode toggle (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 py-1 px-4 text-center">
                <button 
                  onClick={() => {
                    setIsAdmin(false);
                    localStorage.removeItem('isAdmin');
                    toast.success('Tắt chế độ admin');
                  }}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  Tắt chế độ admin
                </button>
              </div>
            )}
          </>
        )}
        
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseItem course={course as Course} />
        
        {/* Call to Action Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {isEnrolled 
                ? 'Tiếp tục hành trình học tập của bạn!' 
                : isPendingApproval
                  ? 'Yêu cầu đăng ký của bạn đang được xử lý'
                  : 'Bắt đầu hành trình học tập của bạn ngay hôm nay!'}
            </h3>
            <p className="text-gray-600">
              {isEnrolled 
                ? lastAccessedContent 
                  ? `Tiếp tục học: ${lastAccessedContent.title}` 
                  : 'Tiếp tục khóa học của bạn từ đúng nơi bạn đã dừng lại.'
                : isPendingApproval
                  ? 'Vui lòng đợi giảng viên phê duyệt yêu cầu đăng ký của bạn.'
                  : isAuthenticated
                    ? 'Đăng ký khóa học này để truy cập vào toàn bộ nội dung.'
                    : 'Đăng nhập và đăng ký khóa học để truy cập vào toàn bộ nội dung.'}
            </p>
          </div>
          
          {!isEnrolled && !isPendingApproval ? (
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
          ) : isPendingApproval ? (
            <div className="mt-4 md:mt-0">
              <div className="px-6 py-3 bg-yellow-100 text-yellow-800 font-semibold rounded-lg flex items-center">
                <span className="animate-pulse mr-2">●</span>
                Đang chờ phê duyệt
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition w-full"
              >
                Kiểm tra trạng thái
              </button>
            </div>
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
                  
                  {userReview ? (
                    <div className="mt-2">
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={star <= (userReview.rating || userReview.rate) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                        <span className="ml-2 text-gray-700">{userReview.rating || userReview.rate}/5</span>
                      </div>
                      <p className="text-gray-700">{userReview.comment}</p>
                    </div>
                  ) : (
                    <p className="text-gray-700">Mỗi người chỉ được đánh giá một lần. Cảm ơn bạn đã đóng góp ý kiến!</p>
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
                      <div key={review.id || review._id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold mr-3">
                              {review.fullName ? review.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-semibold">{review.fullName || review.userFullName || 'Người dùng'}</div>
                              <div className="flex items-center">
                                <div className="flex mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={star <= (review.rating || review.rate || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Admin delete button with debug info */}
                          <div>
                            {isAdmin ? (
                              <button
                                onClick={() => handleInitiateDeleteReview(review.id || review._id || '')}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors text-base font-medium"
                                aria-label="Delete review"
                                title="Xóa đánh giá này"
                              >
                                <Trash size={18} className="mr-2" />
                                <span>Xóa đánh giá</span>
                              </button>
                            ) : (
                              process.env.NODE_ENV === 'development' && (
                                <div className="text-xs text-gray-400 italic">
                                  Admin role needed to delete
                                </div>
                              )
                            )}
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
      
      {/* Delete Review Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Xác nhận xóa đánh giá</h3>
            <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.</p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setReviewToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="animate-pulse mr-2">●</span>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash size={16} className="mr-2" />
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailCoursePage;