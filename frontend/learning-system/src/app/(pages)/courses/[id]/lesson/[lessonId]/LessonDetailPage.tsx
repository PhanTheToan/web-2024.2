"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import { Lesson, Course, User, Quiz } from "@/app/types";
import { lessonService } from "@/services/lessonService";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Check, FileText, PlayCircle, Download, Eye, ExternalLink, ClipboardCheck } from "lucide-react";

// Extended interfaces for handling type checking
interface ExtendedLesson extends Lesson {
  complete?: boolean;
  duration?: number;
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

// Interface for content items (lessons and quizzes)
interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  order: number;
  type: 'lesson' | 'quiz';
  complete?: boolean;
  timeLimit?: number;
}

interface ContentReference {
  id: string;
  type: 'lesson' | 'quiz';
}

const LessonDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<ExtendedLesson | null>(null);
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [nextLesson, setNextLesson] = useState<ExtendedLesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<ExtendedLesson | null>(null);
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

  // Mock user ID for demonstration - in a real app, this would come from authentication
  const currentUserId = 'student1';

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

  // Helper function to check if a quiz is completed
  const isQuizCompleted = (quizId: string): boolean => {
    // In a real implementation, this would check if the user has submitted the quiz
    // For example: return completedQuizzes.has(quizId);
    console.log(`Checking completion status for quiz: ${quizId}`);
    return false;
  };

  // Add a helper function to calculate the number of completed items based on progress percentage
  const getCompletedItemsFromProgress = (totalItems: number, progressPercentage: number): number => {
    return Math.floor((progressPercentage / 100) * totalItems);
  };

  // Update the useEffect that loads ordered content from mockData
  useEffect(() => {
    const loadOrderedContent = async () => {
      if (!course) return;
      
      try {
        // Import data directly from mockData
        const { mockLessons, mockQuizzes, mockEnrollments } = await import('@/data/mockData');
        
        // Filter for current course
        const courseLessons = mockLessons.filter(l => l.courseId === courseId);
        const courseQuizzes = mockQuizzes.filter(q => q.courseId === courseId);
        
        // Get user enrollment to determine progress
        const userEnrollment = mockEnrollments.find(
          e => e.userId === currentUserId && e.courseId === courseId
        );
        
        const enrollmentProgress = userEnrollment?.progress || 0;
        const totalContentItems = courseLessons.length + courseQuizzes.length;
        const completedItemCount = getCompletedItemsFromProgress(totalContentItems, enrollmentProgress);
        
        console.log(`User progress: ${enrollmentProgress}%, marking ${completedItemCount} items as completed out of ${totalContentItems}`);
        
        // Create combined and sorted items array
        const combinedItems = [
          ...courseLessons.map(lesson => ({
            _id: lesson._id,
            title: lesson.title || '',
            description: lesson.description || '',
            order: typeof lesson.order === 'number' ? lesson.order : 0,
            type: 'lesson' as const,
            timeLimit: lesson.timeLimit
          })),
          ...courseQuizzes.map(quiz => ({
            _id: quiz._id,
            title: quiz.title || '',
            description: quiz.description || '',
            order: typeof quiz.order === 'number' ? quiz.order : 0,
            type: 'quiz' as const,
            timeLimit: quiz.timeLimit
          }))
        ].sort((a, b) => a.order - b.order);
        
        // Mark items as completed based on progress percentage
        const itemsWithCompletionStatus = combinedItems.map((item, index) => {
          // Mark as completed if: 
          // 1. It's within the completed items count based on progress OR
          // 2. It's explicitly marked as completed in completedLessons
          const isCompleted = 
            (index < completedItemCount) || 
            (item.type === 'lesson' && completedLessons.has(item._id)) ||
            (item.type === 'quiz' && isQuizCompleted(item._id));
            
          return {
            ...item,
            complete: isCompleted
          };
        });
        
        setOrderedContent(itemsWithCompletionStatus);
        
        console.log('Ordered content updated with completion status:', 
          itemsWithCompletionStatus.map(item => ({
            id: item._id,
            title: item.title,
            type: item.type,
            order: item.order,
            complete: item.complete
          }))
        );
      } catch (err) {
        console.error('Error loading ordered content:', err);
      }
    };
    
    if (course) {
      loadOrderedContent();
    }
  }, [course, courseId, completedLessons]);

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both course and lesson data
        const [courseData, lessonData, enrollment] = await Promise.all([
          courseService.getCourseById(courseId),
          lessonService.getLessonById(lessonId),
          enrollmentService.getEnrollment(currentUserId, courseId)
        ]);
        
        // Cast courseData to ExtendedCourse and ensure lessons is an array of ExtendedLesson
        const extendedCourseData: ExtendedCourse = {
          ...courseData,
          lessons: Array.isArray(courseData.lessons) 
            ? courseData.lessons.map(lesson => {
                // If lesson is just a string ID, fetch the actual lesson
                if (typeof lesson === 'string') {
                  // This would normally fetch the lesson, but for now just return a minimal object
                  return {
                    _id: lesson,
                    title: '', // Will be populated later
                    description: '',
                    courseId: courseId,
                    content: '',
                    videoUrl: '',
                    materials: [],
                    order: 0,
                    createdAt: new Date()
                  } as ExtendedLesson;
                }
                // If it's already a lesson object, return it as ExtendedLesson
                return lesson as ExtendedLesson;
              })
            : [],
          quizzes: Array.isArray(courseData.quizzes) 
            ? courseData.quizzes.map(quiz => typeof quiz === 'string' ? { _id: quiz } as ExtendedQuiz : quiz as ExtendedQuiz)
            : [],
          studentsEnrolled: Array.isArray(courseData.studentsEnrolled)
            ? courseData.studentsEnrolled.map(student => typeof student === 'string' ? { _id: student } as User : student as User)
            : []
        };
        
        setCourse(extendedCourseData);
        setLesson(lessonData as ExtendedLesson);
        
        // Check if user is enrolled
        if (!enrollment) {
          // Redirect to course page if not enrolled
          toast.error('Bạn cần đăng ký khóa học trước khi học');
          router.push(`/courses/${courseId}`);
          return;
        }
        
        // Find the current lesson index in the course lessons
        if (courseData && lessonData) {
          // DIRECTLY IMPORT FROM SERVICES TO ENSURE WE GET THE ACTUAL ORDER VALUES
          // This ensures we access the same mockData that's used in the services
          const { mockLessons, mockQuizzes } = await import('@/data/mockData');
          
          console.log('Imported mockLessons direct from source, checking order values:');
          mockLessons.forEach(lesson => {
            if (lesson.courseId === courseId) {
              console.log(`Lesson ${lesson._id} (${lesson.title}): order = ${lesson.order}`);
            }
          });
          
          console.log('Imported mockQuizzes direct from source, checking order values:');
          mockQuizzes.forEach(quiz => {
            if (quiz.courseId === courseId) {
              console.log(`Quiz ${quiz._id} (${quiz.title}): order = ${quiz.order}`);
            }
          });
          
          // Filter lessons and quizzes for this course
          const courseLessons = mockLessons.filter(l => l.courseId === courseId);
          const courseQuizzes = mockQuizzes.filter(q => q.courseId === courseId);
          
          // Create combined content array with correct order values FROM THE SOURCE
          const orderedContent: ContentItem[] = [
            ...courseLessons.map(lesson => ({
              _id: lesson._id,
              title: lesson.title || '',
              description: lesson.description || '',
              order: typeof lesson.order === 'number' ? lesson.order : 0,
              type: 'lesson' as const,
              complete: false,
              timeLimit: lesson.timeLimit
            })),
            ...courseQuizzes.map(quiz => ({
              _id: quiz._id,
              title: quiz.title || '',
              description: quiz.description || '',
              order: typeof quiz.order === 'number' ? quiz.order : 0,
              type: 'quiz' as const,
              complete: false,
              timeLimit: quiz.timeLimit
            }))
          ];
          
          // Sort the content by order
          orderedContent.sort((a, b) => a.order - b.order);
          
          console.log('Final orderedContent from direct mockData import:', 
            orderedContent.map(item => ({
              id: item._id,
              title: item.title,
              type: item.type,
              order: item.order
            }))
          );
          
          // Find current content index
          const currentIndex = orderedContent.findIndex(item => 
            item.type === 'lesson' && item._id === lessonId
          );
          
          console.log(`Current lesson ID: ${lessonId}, index in ordered content: ${currentIndex}`);
          
          // Mark lessons before current as completed
          const completed = new Set<string>();
          for (let i = 0; i < currentIndex; i++) {
            const item = orderedContent[i];
            if (item.type === 'lesson') {
              completed.add(item._id);
            }
          }
          setCompletedLessons(completed);
          
          // Set previous and next content based on combined ordering
          if (currentIndex > 0) {
            const prev = orderedContent[currentIndex - 1];
            setPrevContent({ id: prev._id, type: prev.type });
          } else {
            setPrevContent(null);
          }
          
          if (currentIndex < orderedContent.length - 1) {
            const next = orderedContent[currentIndex + 1];
            setNextContent({ id: next._id, type: next.type });
          } else {
            setNextContent(null);
          }
          
          // Update the course object with full content
          extendedCourseData.lessons = courseLessons.map(l => ({
            ...l,
            complete: completed.has(l._id)
          } as ExtendedLesson));
          
          extendedCourseData.quizzes = courseQuizzes.map(q => ({
            ...q,
            complete: false
          } as ExtendedQuiz));
          
          setCourse({ ...extendedCourseData });
          
          // For legacy support, still set prevLesson and nextLesson
          const lessonItems = courseLessons.sort((a, b) => 
            (typeof a.order === 'number' ? a.order : 0) - (typeof b.order === 'number' ? b.order : 0)
          );
          const lessonIndex = lessonItems.findIndex(l => l._id === lessonId);
          
          if (lessonIndex > 0) {
            setPrevLesson(lessonItems[lessonIndex - 1] as ExtendedLesson);
          } else {
            setPrevLesson(null);
          }
          
          if (lessonIndex < lessonItems.length - 1) {
            setNextLesson(lessonItems[lessonIndex + 1] as ExtendedLesson);
          } else {
            setNextLesson(null);
          }
          
          // Update enrollment progress automatically when accessing a lesson
          const lessonCount = lessonItems.length || 1; // Avoid division by zero
          const progress = Math.round(((completed.size + 1) / lessonCount) * 100);
          if (enrollment.progress < progress) {
            await enrollmentService.updateProgress(currentUserId, courseId, progress);
          }
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError('Không thể tải thông tin bài học');
        toast.error('Không thể tải thông tin bài học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, router]);

  // Timer effect for tracking elapsed time
  useEffect(() => {
    if (!lesson || !lesson.timeLimit || isLoading) return;

    const tick = () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      setElapsedTime(prevTime => prevTime + delta);
      lastTickRef.current = now;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // Update elapsed time one last time before pausing
          tick();
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lesson, isLoading]); // Re-run if lesson or loading state changes

  const handleMarkComplete = async () => {
    if (!lesson || !course || !lesson.timeLimit) return;

    // Check time requirement (75% of lesson time limit)
    const requiredSeconds = lesson.timeLimit * 60 * 0.75;
    if (elapsedTime < requiredSeconds) {
      const remainingMinutes = Math.ceil((requiredSeconds - elapsedTime) / 60);
      toast.error(`Bạn cần xem bài học thêm khoảng ${remainingMinutes} phút để hoàn thành.`);
      return;
    }

    setIsUpdatingProgress(true);
    try {
      // Mark the lesson as complete
      await lessonService.markLessonComplete(lesson._id);
      
      // Add to completed lessons
      const newCompleted = new Set(completedLessons);
      newCompleted.add(lesson._id);
      setCompletedLessons(newCompleted);
      
      // Calculate progress percentage
      const progress = Math.round((newCompleted.size / course.lessons.length) * 100);
      
      // Update enrollment progress
      await enrollmentService.updateProgress(currentUserId, courseId, progress);
      
      // If this is the last lesson AND there's no next content item, mark the course as complete
      if (!nextLesson && !nextContent && progress >= 100) {
        await enrollmentService.markCourseComplete(currentUserId, courseId);
        toast.success('Chúc mừng! Bạn đã hoàn thành khóa học!');
        router.push(`/courses/${courseId}`);
        return;
      }
      
      toast.success('Đã đánh dấu hoàn thành bài học');
      
      // Navigate to next content item if available
      if (nextContent) {
        if (nextContent.type === 'lesson') {
          router.push(`/courses/${courseId}/lesson/${nextContent.id}`);
        } else {
          router.push(`/courses/${courseId}/quiz/${nextContent.id}`);
        }
      } else if (nextLesson) {
        // Fallback to nextLesson if nextContent is not set
        router.push(`/courses/${courseId}/lesson/${nextLesson._id}`);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Không thể đánh dấu hoàn thành bài học');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Check if the current lesson meets the time requirement
  const meetsTimeRequirement = () => {
    if (!lesson || !lesson.timeLimit) return false;
    const requiredSeconds = lesson.timeLimit * 60 * 0.75;
    return elapsedTime >= requiredSeconds;
  };

  // Helper function to get only lesson count
  const getCourseContentLessonsCount = (): number => {
    return course?.lessons.length || 1; // Avoid division by zero
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
              Bài {lesson.order}/{course.lessons.length}
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
          </div>
          
          {/* Time Progress Circle */}
          {lesson.timeLimit && (
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
                          : 'border border-gray-200 hover:border-primary-200'
                      } ${!isAccessible && item._id !== lesson?._id ? 'opacity-60' : ''}`}
                      onClick={(e) => !isAccessible && handleContentItemClick(e, item)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {item.type === 'lesson' ? (
                          <BookOpen className="w-5 h-5 text-primary-500" />
                        ) : (
                          <ClipboardCheck className="w-5 h-5 text-primary-500" />
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
                          <div className="bg-green-500 text-white rounded-full p-1" title="Đã hoàn thành">
                            <Check className="w-3 h-3" />
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
                      Bài {lesson.order}/{course.lessons.length}
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
                  {lesson.materials.map((material, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg overflow-hidden hover:shadow-md transition-all ${
                        isPdf(material) ? 'cursor-pointer' : ''
                      } ${selectedPdf === material ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                      onClick={() => isPdf(material) && setSelectedPdf(material)}
                    >
                      <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className={`w-5 h-5 mr-2 ${
                            isPdf(material) ? 'text-red-500' : 'text-primary-600'
                          }`} />
                          <h3 className="font-medium">{getFileName(material)}</h3>
                        </div>
                        {selectedPdf === material && isPdf(material) && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                            Đang xem
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="mb-3 text-sm text-gray-600">
                          {isPdf(material) 
                            ? 'Tài liệu PDF bổ sung cho bài học' 
                            : 'Tài liệu bổ sung cho bài học'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {isPdf(material) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPdf(material);
                              }}
                              className="text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-md border border-primary-600 text-sm inline-flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Xem PDF
                            </button>
                          )}
                          <a 
                            href={material} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-md border border-primary-600 text-sm inline-flex items-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Mở liên kết
                          </a>
                          <a 
                            href={material} 
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
                  ))}
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
                {lesson.content.split('\n\n').map((paragraph, index) => (
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
              ) : prevLesson ? (
                <Link
                  href={`/courses/${courseId}/lesson/${prevLesson._id}`}
                  className="mb-4 sm:mb-0 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center sm:justify-start"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  <span>Bài trước</span>
                </Link>
              ) : (
                <div className="mb-4 sm:mb-0 w-full sm:w-auto"></div>
              )}

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
                ) : nextContent || nextLesson ? (
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

              {nextContent ? (
                meetsTimeRequirement() ? (
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
              ) : nextLesson ? (
                // Fall back to nextLesson if nextContent is not set
                meetsTimeRequirement() ? (
                  <Link
                    href={`/courses/${courseId}/lesson/${nextLesson._id}`}
                    className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 flex items-center justify-center sm:justify-end"
                  >
                    <span>Bài tiếp theo</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const requiredSeconds = lesson?.timeLimit ? lesson.timeLimit * 60 * 0.75 : 0;
                      const remainingMinutes = Math.ceil((requiredSeconds - elapsedTime) / 60);
                      toast.error(`Bạn cần xem bài học thêm khoảng ${remainingMinutes} phút để mở khóa bài tiếp theo.`);
                    }}
                    className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-gray-400 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center sm:justify-end opacity-70"
                    title="Xem bài học hiện tại ít nhất 75% thời gian để mở khóa"
                  >
                    <span>Bài tiếp theo</span>
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