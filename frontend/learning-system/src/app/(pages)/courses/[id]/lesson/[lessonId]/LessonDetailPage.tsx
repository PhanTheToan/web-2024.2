"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import { Lesson, Course, User, Quiz, LessonMaterial } from "@/app/types";
// import { lessonService } from "@/services/lessonService";
// import { courseService } from "@/services/courseService";
// import { enrollmentService } from "@/services/enrollmentService";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Check, FileText, PlayCircle, Download, Eye, ExternalLink, ClipboardCheck } from "lucide-react";
import * as dotenv from "dotenv";

dotenv.config();

// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

// Helper function to get and set cookies
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/`;
};

// Add mock data import for breadcrumb
// import { mockCourses } from "@/data/mockCourses";

// Extended interfaces for handling type checking
interface ExtendedLesson extends Omit<Lesson, 'content'> {
  complete?: boolean;
  duration?: number;
  materials?: LessonMaterial[] | string[];
  videoUrl?: string;
  content?: string;
}

interface ExtendedQuiz extends Quiz {
  complete?: boolean;
}

interface ExtendedCourse extends Omit<Course, 'lessons' | 'quizzes' | 'studentsEnrolled' | 'teacherId'> {
  timeLimit?: number;
  lessons: ExtendedLesson[];
  quizzes: ExtendedQuiz[];
  studentsEnrolled: User[];
  teacherId: User | string;
}

// Response from lesson endpoint
// interface LessonResponse {
//   id: string;
//   courseId: string;
//   title: string;
//   shortTitle: string;
//   content: string;
//   videoUrl: string;
//   materials: string[];
//   order: number;
//   timeLimit?: number;
//   createdAt: string;
//   updatedAt: string;
// }

// Interface for content items (lessons and quizzes)
interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  order: number;
  type: 'lesson' | 'quiz';
  complete?: boolean;
  currentlyLearning?: boolean;
  timeLimit?: number;
  lessonId?: string;
  quizId?: string;
  orderLesson?: number;
  orderQuiz?: number;
}

interface ContentReference {
  id: string;
  type: 'lesson' | 'quiz';
}

// Updated interface to match actual response format
interface LessonQuizResponseData {
  body: {
    notLearned?: {
      quizzes: Array<{
        quizId: string;
        title: string;
        questionCount: number;
        orderQuiz: number;
        passingScore: number;
      }>;
      lessons: Array<{
        lessonId: string;
        lessonTitle: string;
        lessonShortTitle: string;
        orderLesson: number;
      }>;
    };
    learned?: {
      quizzes: Array<{
        quizId: string;
        title: string;
        questionCount: number;
        orderQuiz: number;
        passingScore: number;
      }>;
      lessons: Array<{
        lessonId: string;
        lessonTitle: string;
        lessonShortTitle: string;
        orderLesson: number;
      }>;
    };
  };
  statusCodeValue?: number;
  statusCode?: string;
}

// Interface for user authentication response
// interface UserInfo {
//   _id: string;
//   username: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: string;
//   coursesEnrolled: string[];
//   profileImage: string | null;
// }

const LessonDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<ExtendedLesson | null>(null);
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  // const [nextLesson, setNextLesson] = useState<ExtendedLesson | null>(null);
  // const [prevLesson, setPrevLesson] = useState<ExtendedLesson | null>(null);
  const [nextContent, setNextContent] = useState<ContentReference | null>(null);
  const [prevContent, setPrevContent] = useState<ContentReference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Time spent in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const [orderedContent, setOrderedContent] = useState<ContentItem[]>([]); // New state for ordered content
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Changed default to true for testing
  // const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  // Function to get file name from path
  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };
  
  // Function to check if file is a PDF
  const isPdf = (path: string) => {
    return path.toLowerCase().endsWith('.pdf');
  };

  // Check user authentication
  const checkUserAuth = async () => {
    try {
      // Use the auth/check endpoint from the screenshot
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
        return false;
      }

      const authData = await authResponse.json();
      console.log('Auth data:', authData);
      
      if (authData.status === 200 && authData.data) {
        // setUserInfo(authData.data);
        setIsAuthenticated(true);
        
        // Check if user is enrolled in this course
        if (Array.isArray(authData.data.coursesEnrolled) && 
            authData.data.coursesEnrolled.includes(courseId)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Fetch lesson content from the API
  const fetchLessonData = async () => {
    try {
      // Use the lesson info API as shown in the first screenshot
      const lessonResponse = await fetch(`${API_BASE_URL}/course/lesson/${lessonId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!lessonResponse.ok) {
        throw new Error('Failed to fetch lesson data');
      }

      const lessonData = await lessonResponse.json();
      console.log('Lesson data:', lessonData);
      
      const parsedLesson = lessonData.body || lessonData;
      
      // Map the API response to our ExtendedLesson type
      const extendedLesson: ExtendedLesson = {
        _id: parsedLesson.id || parsedLesson._id,
        courseId: parsedLesson.courseId,
        title: parsedLesson.title,
        content: parsedLesson.content,
        videoUrl: parsedLesson.videoUrl,
        materials: parsedLesson.materials || [],
        order: parsedLesson.order || parsedLesson.orderLesson,
        timeLimit: parsedLesson.timeLimit,
        createdAt: new Date(parsedLesson.createdAt),
        description: parsedLesson.shortTitle
      };
      
      setLesson(extendedLesson);
      return extendedLesson;
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      throw error;
    }
  };

  // Fetch course content from the API - fixed error handling
  const fetchCourseContent = async () => {
    try {
      // Use lesson-quiz (with hyphen) for enrolled users to get learned/not learned content
      // This endpoint returns which lessons and quizzes the user has completed
      const contentResponse = await fetch(`${API_BASE_URL}/course/lesson-quiz/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to fetch course content');
      }

      const contentData = await contentResponse.json() as LessonQuizResponseData;
      console.log('Course content data:', contentData);
      
      const combinedItems: ContentItem[] = [];
      
      // Process learned and not learned content
      if (contentData.body) {
        // Process not learned lessons - these are items the user still needs to complete
        if (contentData.body.notLearned && contentData.body.notLearned.lessons) {
          contentData.body.notLearned.lessons.forEach(lesson => {
            combinedItems.push({
              _id: lesson.lessonId,
              title: lesson.lessonTitle,
              description: lesson.lessonShortTitle,
              order: lesson.orderLesson,
              orderLesson: lesson.orderLesson,
              type: 'lesson',
              complete: false,
              lessonId: lesson.lessonId
            });
          });
        }
        
        // Process not learned quizzes - these are quizzes the user still needs to complete
        if (contentData.body.notLearned && contentData.body.notLearned.quizzes) {
          contentData.body.notLearned.quizzes.forEach(quiz => {
            combinedItems.push({
              _id: quiz.quizId,
              title: quiz.title,
              order: quiz.orderQuiz,
              orderQuiz: quiz.orderQuiz,
              type: 'quiz',
              complete: false,
              quizId: quiz.quizId
            });
          });
        }
        
        // Process learned lessons - these are lessons the user has already completed
        if (contentData.body.learned && contentData.body.learned.lessons) {
          contentData.body.learned.lessons.forEach(lesson => {
            combinedItems.push({
              _id: lesson.lessonId,
              title: lesson.lessonTitle,
              description: lesson.lessonShortTitle,
              order: lesson.orderLesson,
              orderLesson: lesson.orderLesson,
              type: 'lesson',
              complete: true, // Mark as completed
              lessonId: lesson.lessonId
            });
          });
        }
        
        // Process learned quizzes - these are quizzes the user has already completed
        if (contentData.body.learned && contentData.body.learned.quizzes) {
          contentData.body.learned.quizzes.forEach(quiz => {
            combinedItems.push({
              _id: quiz.quizId,
              title: quiz.title,
              order: quiz.orderQuiz,
              orderQuiz: quiz.orderQuiz,
              type: 'quiz',
              complete: true, // Mark as completed
              quizId: quiz.quizId
            });
          });
        }
      }
      
      // Sort content by order
      combinedItems.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Mark items as "currently learning"
      // Find the first incomplete item - this is what the user should be learning now
      const firstIncompleteIndex = combinedItems.findIndex(item => !item.complete);
      if (firstIncompleteIndex !== -1) {
        // If current lesson is the first incomplete item, it's what the user is currently learning
        const isCurrentLessonCurrentlyLearning = 
          combinedItems[firstIncompleteIndex].type === 'lesson' && 
          combinedItems[firstIncompleteIndex]._id === lessonId;
        
        if (isCurrentLessonCurrentlyLearning) {
          // Current lesson is the first incomplete item
          combinedItems[firstIncompleteIndex].currentlyLearning = true;
        } else {
          // If user is viewing a lesson that's not the first incomplete,
          // treat the current lesson as "currently learning" instead
          const currentLessonIndex = combinedItems.findIndex(
            item => item.type === 'lesson' && item._id === lessonId
          );
          
          if (currentLessonIndex !== -1 && !combinedItems[currentLessonIndex].complete) {
            // Mark the current lesson as "currently learning"
            combinedItems[currentLessonIndex].currentlyLearning = true;
            // Also mark the first incomplete item as "currently learning" if different
            if (currentLessonIndex !== firstIncompleteIndex) {
              combinedItems[firstIncompleteIndex].currentlyLearning = true;
            }
          } else {
            // If current lesson is already complete, mark first incomplete as "currently learning"
            combinedItems[firstIncompleteIndex].currentlyLearning = true;
          }
        }
      }
      
      setOrderedContent(combinedItems);
      
      // Mark completed lessons
      const completed = new Set<string>();
      combinedItems.forEach(item => {
        if (item.type === 'lesson' && item.complete) {
          completed.add(item._id);
        }
      });
      setCompletedLessons(completed);
          
      // Find the current lesson in the ordered content
      const currentIndex = combinedItems.findIndex(item => 
        item.type === 'lesson' && item._id === lessonId
      );
      
      // Set previous and next content
      if (currentIndex > 0) {
        const prev = combinedItems[currentIndex - 1];
        setPrevContent({ id: prev._id, type: prev.type });
      } else {
        setPrevContent(null);
      }
          
      if (currentIndex < combinedItems.length - 1) {
        const next = combinedItems[currentIndex + 1];
        setNextContent({ id: next._id, type: next.type });
      } else {
        setNextContent(null);
      }
          
      return combinedItems;
    } catch (error) {
      console.error('Error fetching course content:', error);
      // Initialize with empty data instead of throwing error
      setOrderedContent([]);
      setPrevContent(null);
      setNextContent(null);
      return [];
    }
  };

  // Fetch course info from the API
  const fetchCourseInfo = async () => {
    try {
      // Use the course info API
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
      console.log('Course info:', courseData);
      
      const parsedCourse = courseData.body || courseData;
      
      // Create a minimal course object
      const extendedCourse: ExtendedCourse = {
        _id: parsedCourse.id || parsedCourse._id,
        title: parsedCourse.title,
        description: parsedCourse.description,
        thumbnail: parsedCourse.thumbnail,
        price: parsedCourse.price,
        categories: parsedCourse.categories || [],
        createdAt: parsedCourse.createdAt,
        lessons: [],
        quizzes: [],
        studentsEnrolled: [],
        teacherId: parsedCourse.teacherId || ''
      };
      
      setCourse(extendedCourse);
      return extendedCourse;
    } catch (error) {
      console.error('Error fetching course info:', error);
      throw error;
    }
  };

  // Load saved timer state from cookies
  const loadTimerState = () => {
    try {
      const timerCookie = getCookie(`lesson_timer_${lessonId}`);
      if (!timerCookie) return 0;
      
      // Parse the cookie value
      const timerData = JSON.parse(atob(timerCookie));
      
      // Verify it's for the current lesson and course
      if (timerData.lessonId === lessonId && timerData.courseId === courseId) {
        console.log('Loaded saved timer state:', timerData.elapsed);
        return timerData.elapsed;
      }
      return 0;
    } catch (error) {
      console.error('Error loading timer state:', error);
      return 0;
    }
  };

  // Save the timer state to cookies
  const saveTimerState = (elapsedSeconds: number) => {
    try {
      // Create a simple data object with the timer info
      const timerData = {
        lessonId,
        courseId,
        elapsed: elapsedSeconds,
        timestamp: Date.now()
      };
      
      // Convert to base64 for storage
      const timerString = btoa(JSON.stringify(timerData));
      
      // Save to cookie with 7-day expiration
      setCookie(`lesson_timer_${lessonId}`, timerString, 7);
      console.log('Saved timer state:', elapsedSeconds);
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if user is authenticated and enrolled in the course
        await checkUserAuth(); // Don't assign the result to unused variable
        
        if (!isAuthenticated) {
          console.log('User is not authenticated');
          // We'll still show the data, enrollment check will be done elsewhere
        }
        
        // Fetch lesson, course content, and course info in parallel
        await Promise.all([
          fetchLessonData(),
          fetchCourseContent(),
          fetchCourseInfo()
        ]);
        
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError('Không thể tải thông tin bài học');
        toast.error('Không thể tải thông tin bài học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId]);

  // Timer effect for tracking elapsed time - updated to use persisted state and fix errors
  useEffect(() => {
    if (!lesson || isLoading) return;

    // If no time limit, don't need to store in a variable
    // const lessonTimeLimit = lesson.timeLimit || 5;

    // Load the initial state from cookies when component mounts
    if (elapsedTime === 0) {
      const savedTime = loadTimerState();
      if (savedTime > 0) {
        setElapsedTime(savedTime);
      }
    }

    // Check if current lesson is already completed
    const isLessonCompleted = completedLessons.has(lessonId);
    
    // If lesson is already completed, no need to setup a timer
    if (isLessonCompleted) {
      return;
    }

    const tick = () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      
      if (delta > 0) { // Avoid negative delta (can happen with date/time changes)
        setElapsedTime(prevTime => {
          const newTime = prevTime + delta;
          
          // Check if time threshold is met (75% of time limit)
          const timeLimit = lesson.timeLimit || 5; // Default 5 minutes
          const requiredTime = timeLimit * 60 * 0.75;
          
          // If time threshold is met and lesson is not already completed, mark as complete automatically
          if (newTime >= requiredTime && !completedLessons.has(lessonId) && !isUpdatingProgress) {
            // Call the API to update progress
            updateLessonProgress();
          }
          
          // Save to cookie every 15 seconds to avoid too frequent writes
          if (delta >= 15 || Math.floor(newTime / 15) > Math.floor(prevTime / 15)) {
            saveTimerState(newTime);
          }
          return newTime;
        });
      }
      
      lastTickRef.current = now;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // Update elapsed time one last time before pausing
          tick();
          // Save state when user leaves the page
          saveTimerState(elapsedTime);
        }
      } else {
        if (!timerRef.current) {
          lastTickRef.current = Date.now(); // Reset last tick time on resume
          timerRef.current = setInterval(tick, 1000);
        }
      }
    };

    // Start timer immediately if visible
    if (document.visibilityState === 'visible') {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(tick, 1000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Save timer state when component unmounts
      saveTimerState(elapsedTime);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lesson, isLoading, completedLessons, lessonId]); // Added completedLessons and lessonId as dependencies

  // Add function to update lesson progress automatically using the API from the screenshot
  const updateLessonProgress = async () => {
    if (!lesson || completedLessons.has(lessonId) || isUpdatingProgress) return;
    
    setIsUpdatingProgress(true);
    try {
      // API shown in the screenshot
      const response = await fetch(`${API_BASE_URL}/enrollments/update-progress?courseId=${courseId}&itemId=${lessonId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson progress');
      }

      const data = await response.json();
      console.log('Progress update response:', data);
      
      // If update was successful, update local state
      if (data.statusCode === "OK" || data.body === "Cập nhật tiến độ thành công") {
        // Add to completed lessons locally
        const newCompleted = new Set(completedLessons);
        newCompleted.add(lessonId);
        setCompletedLessons(newCompleted);
        
        // Update the orderedContent to mark this lesson as complete
        const updatedContent = orderedContent.map(item => {
          if (item.type === 'lesson' && item._id === lessonId) {
            return { ...item, complete: true };
          }
          return item;
        });
        setOrderedContent(updatedContent);
        
        // Clear the timer cookie as this lesson is now complete
        setCookie(`lesson_timer_${lessonId}`, '', -1);
        
        toast.success('Bài học đã được đánh dấu hoàn thành tự động');
        
        // Fetch updated course content to refresh the learned/notLearned data
        await fetchCourseContent();
      }
    } catch (err) {
      console.error('Error updating progress automatically:', err);
      // Don't show error toast to user for automatic update
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Get combined course content (lessons and quizzes) in order
  const getCourseContent = (): ContentItem[] => {
    // Return the pre-loaded ordered content
    return orderedContent;
  };

  // Check if a course content item is accessible
  const isContentItemAccessible = (item: ContentItem) => {
    // If it's the current lesson, it's accessible
    if (item.type === 'lesson' && item._id === lesson?._id) return true;
    
    // If it's a completed lesson or quiz, it's accessible
    if (item.complete) return true;
    
    // Get the ordered content
    const contentItems = getCourseContent();
    
    // Find current content index and target item index
    const currentIndex = contentItems.findIndex(i => 
      i.type === 'lesson' && i._id === lesson?._id
    );
    
    if (currentIndex === -1) return false;
    
    const targetIndex = contentItems.findIndex(i => i._id === item._id);
    
    // Allow access to items before current
    if (targetIndex < currentIndex) return true;
    
    // For the next item, check if the current item is already completed
    // If completed, allow access regardless of time spent
    if (targetIndex === currentIndex + 1) {
      // If current item is completed, allow access to next item
      const currentItem = contentItems[currentIndex];
      if (currentItem && currentItem.complete) {
        return true;
      }
      
      // Otherwise, check time requirement
      return meetsTimeRequirement();
    }
    
    // For items beyond next, check if all previous items are completed
    if (targetIndex > currentIndex + 1) {
      // Check if all items between current and target are completed
      for (let i = currentIndex; i < targetIndex; i++) {
        const intermediateItem = contentItems[i];
        // If current item (at currentIndex) is completed, continue to next item
        if (i === currentIndex && intermediateItem.complete) {
          continue;
        }
        // For other items, if not completed, block access
        if (!intermediateItem.complete) return false;
      }
      
      // If we got here, all required previous items are completed
      return true;
    }
    
    return false;
  };

  // Handle content item navigation
  const handleContentItemClick = (e: React.MouseEvent, item: ContentItem) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('Bạn cần đăng nhập để truy cập nội dung này');
      router.push('/auth/login?redirect=' + encodeURIComponent(`/courses/${courseId}/lesson/${lessonId}`));
      return;
    }
    
    if (!isContentItemAccessible(item)) {
      e.preventDefault();
      
      // If it's the next content item, show time requirement message
      const content = getCourseContent();
      const currentIndex = content.findIndex(i => i.type === 'lesson' && i._id === lesson?._id);
      const targetIndex = content.findIndex(i => i._id === item._id);
      
      if (targetIndex === currentIndex + 1) {
        toast.error(`Bạn cần xem bài học hiện tại ít nhất 75% thời gian để mở khóa nội dung tiếp theo.`);
      } else {
        toast.error(`Bạn cần hoàn thành các nội dung trước để mở khóa nội dung này.`);
      }
    }
  };

  // Check if the current lesson meets the time requirement
  const meetsTimeRequirement = () => {
    if (!lesson) return false;
    
    // If no time limit, use a default of 5 minutes (300 seconds)
    const requiredSeconds = (lesson.timeLimit || 5) * 60 * 0.75; // 75% of the total time
    return elapsedTime >= requiredSeconds;
  };

  // Helper function to get only lesson count
  const getCourseContentLessonsCount = (): number => {
    return orderedContent.filter(item => item.type === 'lesson').length || 1; // Avoid division by zero
  };

  // Handle marking lesson as complete - updated to clean up saved timer
  const handleMarkComplete = async () => {
    if (!lesson || !course) return;
    
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để đánh dấu hoàn thành bài học');
      router.push('/auth/login?redirect=' + encodeURIComponent(`/courses/${courseId}/lesson/${lessonId}`));
      return;
    }

    // If lesson is already completed, just navigate to next content
    if (completedLessons.has(lessonId)) {
      if (nextContent) {
        if (nextContent.type === 'lesson') {
          router.push(`/courses/${courseId}/lesson/${nextContent.id}`);
        } else {
          router.push(`/courses/${courseId}/quiz/${nextContent.id}`);
        }
      }
      return;
    }

    // Check time requirement (75% of lesson time limit)
    const timeLimit = lesson.timeLimit || 5; // Use 5 minutes as default if no time limit
    const requiredSeconds = timeLimit * 60 * 0.75;
    if (elapsedTime < requiredSeconds) {
      const remainingMinutes = Math.ceil((requiredSeconds - elapsedTime) / 60);
      toast.error(`Bạn cần xem bài học thêm khoảng ${remainingMinutes} phút để hoàn thành.`);
      return;
    }

    setIsUpdatingProgress(true);
    try {
      // Use the API from the screenshot instead of the previous endpoint
      const response = await fetch(`${API_BASE_URL}/enrollments/update-progress?courseId=${courseId}&itemId=${lessonId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lesson progress');
      }
      
      const data = await response.json();
      console.log('Progress update response:', data);
      
      // Add to completed lessons locally
      const newCompleted = new Set(completedLessons);
      newCompleted.add(lessonId);
      setCompletedLessons(newCompleted);
      
      // Update the orderedContent to mark this lesson as complete
      const updatedContent = orderedContent.map(item => {
        if (item.type === 'lesson' && item._id === lessonId) {
          return { ...item, complete: true };
        }
        return item;
      });
      setOrderedContent(updatedContent);
      
      // Clear the timer cookie as this lesson is now complete
      setCookie(`lesson_timer_${lessonId}`, '', -1);
      
      toast.success('Đã đánh dấu hoàn thành bài học');
      
      // Fetch updated course content to refresh the learned/notLearned data
      await fetchCourseContent();
      
      // Navigate to next content item if available
      if (nextContent) {
        if (nextContent.type === 'lesson') {
          router.push(`/courses/${courseId}/lesson/${nextContent.id}`);
        } else {
          router.push(`/courses/${courseId}/quiz/${nextContent.id}`);
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Không thể đánh dấu hoàn thành bài học');
    } finally {
      setIsUpdatingProgress(false);
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

  if (!lesson || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Không tìm thấy bài học
          </h2>
          <Link 
            href={`/courses/${courseId}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Quay lại khóa học
          </Link>
        </div>
      </div>
    );
  }

  // Count lessons and get current lesson order
  const totalLessons = getCourseContentLessonsCount();
  const currentLessonOrder = lesson.order || 
    orderedContent.find(item => item.type === 'lesson' && item._id === lessonId)?.order || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course header with improved styling */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex justify-between items-center mb-2">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center text-white hover:text-blue-100 transition"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Quay lại khóa học
            </Link>
            <div className="text-sm bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
              Bài {currentLessonOrder}/{totalLessons}
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-3 mb-2">{lesson.title}</h1>
          <div className="flex flex-wrap items-center text-sm text-blue-100">
            <span className="flex items-center mr-4">
              <BookOpen className="w-4 h-4 mr-1" />
              {course.title}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {lesson.timeLimit ? `${lesson.timeLimit} phút` : "Không giới hạn thời gian"}
            </span>
            {completedLessons.has(lessonId) && (
              <span className="flex items-center ml-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                <Check className="w-3 h-3 mr-1" />
                Đã hoàn thành
              </span>
            )}
          </div>
          
          {/* Time Progress Circle - Only show when lesson is not completed */}
          {lesson.timeLimit && !completedLessons.has(lessonId) && (
            <div className="mt-4 flex items-center">
              <div className="relative h-20 w-20 mr-3">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    className="text-blue-300 opacity-30"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  {/* Progress circle */}
                  <circle
                    className="text-white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    // Calculate stroke-dashoffset based on elapsed time vs required time
                    style={{
                      strokeDasharray: `${2 * Math.PI * 42}`,
                      strokeDashoffset: `${2 * Math.PI * 42 * (1 - Math.min(elapsedTime / (lesson.timeLimit * 60 * 0.75), 1))}`,
                      transformOrigin: 'center',
                      transform: 'rotate(-90deg)',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-white text-sm flex flex-col">
                <span className="font-medium">Thời gian xem bài học</span>
                <span className="opacity-80">
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')} / 
                  {Math.floor(lesson.timeLimit * 60 * 0.75 / 60)}:{Math.floor(lesson.timeLimit * 60 * 0.75 % 60).toString().padStart(2, '0')} 
                  ({Math.min(Math.round(elapsedTime / (lesson.timeLimit * 60 * 0.75) * 100), 100)}%)
                </span>
              </div>
            </div>
          )}
          
          {/* Completion message when lesson is already completed */}
          {completedLessons.has(lessonId) && (
            <div className="mt-4 flex items-center bg-green-500/20 p-3 rounded-lg">
              <div className="bg-green-500 text-white rounded-full p-2 mr-3">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-white">
                <p className="font-medium">Bài học đã hoàn thành</p>
                <p className="text-sm opacity-80">Bạn có thể xem lại nội dung bài học hoặc chuyển sang bài tiếp theo</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar with lesson list */}
          <div className="order-2 md:order-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2 text-primary-600" />
                Nội dung khóa học
              </h3>
              
              <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
                {getCourseContent().map((item, index) => {
                  const isAccessible = isContentItemAccessible(item);
                  
                  return (
                    <Link
                      key={index}
                      href={isAccessible ? (
                        item.type === 'lesson'
                          ? `/courses/${courseId}/lesson/${item._id}`
                          : `/courses/${courseId}/quiz/${item._id}`
                      ) : '#'}
                      className={`flex items-center p-3 rounded mb-2 transition-all ${
                        item._id === lesson?._id
                          ? 'bg-primary-50 border-l-4 border-primary-500'
                          : item.currentlyLearning && !item.complete
                          ? 'bg-blue-50 border border-blue-200 hover:border-blue-300'
                          : 'border border-gray-200 hover:border-primary-200'
                      } ${!isAccessible && item._id !== lesson?._id ? 'opacity-60' : ''}`}
                      onClick={(e) => !isAccessible && handleContentItemClick(e, item)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {item.type === 'lesson' ? (
                          <BookOpen className={`w-5 h-5 ${item.currentlyLearning ? 'text-blue-500' : 'text-primary-500'}`} />
                        ) : (
                          <ClipboardCheck className={`w-5 h-5 ${item.currentlyLearning ? 'text-blue-500' : 'text-primary-500'}`} />
                        )}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="font-medium truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.type === 'lesson' ? (
                            item.description && item.description.substring(0, 30) + (item.description.length > 30 ? '...' : '')
                          ) : (
                            <span>
                              {item.timeLimit && `${item.timeLimit} phút • `}
                              Điểm đạt: 60%
                            </span>
                          )}
                        </div>
                      </div>
                      {item.complete ? (
                        <div className="ml-auto">
                          <div className="bg-green-500 text-white rounded-full p-1" title="Đã học">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      ) : item.currentlyLearning ? (
                        <div className="ml-auto">
                          <div className="bg-blue-500 text-white rounded-full p-1" title="Đang học">
                            <PlayCircle className="w-3 h-3" />
                          </div>
                        </div>
                      ) : !isAccessible && item._id !== lesson?._id ? (
                        <div className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <title>Chưa mở khóa</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">
                  Tiến độ khóa học: {Math.round((completedLessons.size / getCourseContentLessonsCount()) * 100)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(completedLessons.size / getCourseContentLessonsCount()) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="md:col-span-2 order-1 md:order-2">
            {/* Video player with improved styling */}
            {lesson.videoUrl && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="bg-gray-800 relative" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={lesson.videoUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
                <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PlayCircle className="w-5 h-5 mr-2 text-primary-400" />
                      <h2 className="font-semibold">{lesson.title}</h2>
                    </div>
                    <div className="text-xs bg-white/20 rounded-full px-3 py-1">
                      Bài {currentLessonOrder}/{totalLessons}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Viewer Section */}
            {selectedPdf && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary-400" />
                    <h2 className="font-semibold">Tài liệu PDF: {getFileName(selectedPdf)}</h2>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={selectedPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white/20 text-white hover:bg-white/30 rounded-full"
                      title="Mở trong tab mới"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={selectedPdf}
                      download
                      className="p-1.5 bg-white/20 text-white hover:bg-white/30 rounded-full"
                      title="Tải xuống"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <iframe
                    src={`${selectedPdf}#toolbar=0&navpanes=0`}
                    className="w-full h-[500px] border rounded"
                    title="PDF Viewer"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Learning materials cards - Updated for PDF viewing */}
            {lesson.materials && lesson.materials.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  Tài liệu học tập
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {lesson.materials.map((material, index) => {
                    const materialPath = typeof material === 'string' ? material : material.path;
                    return (
                    <div 
                      key={index} 
                      className={`border rounded-lg overflow-hidden hover:shadow-md transition-all ${
                          isPdf(materialPath) ? 'cursor-pointer' : ''
                        } ${selectedPdf === materialPath ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                        onClick={() => isPdf(materialPath) && setSelectedPdf(materialPath)}
                    >
                      <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className={`w-5 h-5 mr-2 ${
                              isPdf(materialPath) ? 'text-red-500' : 'text-primary-600'
                          }`} />
                            <h3 className="font-medium">{getFileName(materialPath)}</h3>
                        </div>
                          {selectedPdf === materialPath && isPdf(materialPath) && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                            Đang xem
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="mb-3 text-sm text-gray-600">
                            {isPdf(materialPath) 
                            ? 'Tài liệu PDF bổ sung cho bài học' 
                            : 'Tài liệu bổ sung cho bài học'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {isPdf(materialPath) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                  setSelectedPdf(materialPath);
                              }}
                              className="text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-md border border-primary-600 text-sm inline-flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Xem PDF
                            </button>
                          )}
                          <a 
                              href={materialPath} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-md border border-primary-600 text-sm inline-flex items-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Mở liên kết
                          </a>
                          <a 
                              href={materialPath} 
                            download 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-gray-700 border border-gray-300 text-sm inline-flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Tải xuống
                          </a>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lesson content with improved styling */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                Nội dung bài học
              </h2>
              <div className="prose max-w-none">
                {lesson.content && lesson.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Navigation buttons with improved styling */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-md p-6">
              {prevContent ? (
                <Link
                  href={prevContent.type === 'lesson' ? 
                    `/courses/${courseId}/lesson/${prevContent.id}` : 
                    `/courses/${courseId}/quiz/${prevContent.id}`}
                  className="mb-4 sm:mb-0 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center sm:justify-start"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  <span>Nội dung trước</span>
                </Link>
              ) : (
                <div className="mb-4 sm:mb-0 w-full sm:w-auto"></div>
              )}

              {completedLessons.has(lessonId) ? (
                // Button for completed lessons
                <button
                  onClick={() => {
                    if (nextContent) {
                      if (nextContent.type === 'lesson') {
                        router.push(`/courses/${courseId}/lesson/${nextContent.id}`);
                      } else {
                        router.push(`/courses/${courseId}/quiz/${nextContent.id}`);
                      }
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition flex items-center justify-center"
                >
                  {nextContent ? (
                    <>
                      <span>Tiếp tục học</span>
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      <span>Đã hoàn thành khóa học</span>
                    </>
                  )}
                </button>
              ) : (
                // Button for incomplete lessons
              <button
                onClick={handleMarkComplete}
                disabled={isUpdatingProgress}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition flex items-center justify-center disabled:opacity-70"
              >
                {isUpdatingProgress ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Đang xử lý...
                  </>
                ) : nextContent ? (
                  <>
                    <span>Tiếp tục</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    <span>Hoàn thành khóa học</span>
                  </>
                )}
              </button>
              )}

              {nextContent ? (
                completedLessons.has(lessonId) || meetsTimeRequirement() ? (
                  <Link
                    href={nextContent.type === 'lesson' ? 
                      `/courses/${courseId}/lesson/${nextContent.id}` : 
                      `/courses/${courseId}/quiz/${nextContent.id}`}
                    className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 flex items-center justify-center sm:justify-end"
                  >
                    <span>{nextContent.type === 'lesson' ? 'Bài tiếp theo' : 'Quiz tiếp theo'}</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const requiredSeconds = lesson?.timeLimit ? lesson.timeLimit * 60 * 0.75 : 0;
                      const remainingMinutes = Math.ceil((requiredSeconds - elapsedTime) / 60);
                      toast.error(`Bạn cần xem bài học thêm khoảng ${remainingMinutes} phút để mở khóa ${nextContent.type === 'lesson' ? 'bài' : 'quiz'} tiếp theo.`);
                    }}
                    className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-gray-400 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center sm:justify-end opacity-70"
                    title="Xem bài học hiện tại ít nhất 75% thời gian để mở khóa"
                  >
                    <span>{nextContent.type === 'lesson' ? 'Bài tiếp theo' : 'Quiz tiếp theo'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>
                )
              ) : (
                <div className="mt-4 sm:mt-0 w-full sm:w-auto"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailPage; 