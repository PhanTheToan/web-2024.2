"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Course } from "@/app/types";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { quizService } from "@/services/quizService";
import { toast } from "react-hot-toast";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import CourseItem from '@/app/components/courseitem/courseItem';
import { BookOpen, Clock, Users, Star, CheckCircle, ClipboardCheck, PlayCircle, Lock } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";

// Extended Course interface with additional optional properties
interface ExtendedCourse extends Omit<Course, 'totalDuration'> {
  requirements?: string[];
  totalDuration?: number;
}

// Combined content item interface to handle both lessons and quizzes
interface ContentItem {
  _id: string;
  type: 'lesson' | 'quiz';
  title: string;
  description?: string;
  timeLimit?: number;
  order?: number;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  passingScore?: number;
}

// Last accessed content interface to track user's progress
interface LastAccessedContent {
  type: 'lesson' | 'quiz';
  id: string;
  title: string;
}

const DetailCoursePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
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

  // Mock user ID for demonstration
  const currentUserId = 'student1';

  const fetchCourse = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const courseId = params.id as string;
      const courseData = await courseService.getCourseById(courseId) as ExtendedCourse;
      setCourse(courseData);
      
      // Check if user is enrolled
      const enrollment = await enrollmentService.getEnrollment(currentUserId, courseId);
      if (enrollment) {
        setIsEnrolled(true);
        setEnrollmentStatus(enrollment.status);
        setEnrollmentProgress(enrollment.progress);
        
        // Try to determine the last accessed content
        await checkUserProgress(courseId, enrollment.progress);
      }

      // Load course content - combines lessons and quizzes
      setLoadingContent(true);
      
      try {
        // First try to get ordered content from the API
        const orderedContent = await courseService.getCourseContent(courseId);
        setContentItems(orderedContent as ContentItem[]);
      } catch (contentError) {
        console.error('Error loading ordered content:', contentError);
        
        // Fallback: Create our own content list
        const items: ContentItem[] = [];
        
        // Process lessons
        if (courseData.lessons && courseData.lessons.length > 0) {
          courseData.lessons.forEach(lesson => {
            const lessonItem: ContentItem = {
              _id: typeof lesson === 'string' ? lesson : lesson._id,
              type: 'lesson',
              title: typeof lesson === 'string' ? 'Lesson' : lesson.title,
              description: typeof lesson === 'string' ? '' : lesson.description,
              timeLimit: typeof lesson === 'string' ? undefined : lesson.timeLimit,
              order: typeof lesson === 'string' ? undefined : lesson.order
            };
            items.push(lessonItem);
          });
        }
        
        // Process quizzes
        if (courseData.quizzes && courseData.quizzes.length > 0) {
          try {
            const quizData = await quizService.getQuizzesByCourseId(courseId);
            quizData.forEach(quiz => {
              items.push({
                _id: quiz._id,
                type: 'quiz',
                title: quiz.title,
                questions: quiz.questions,
                passingScore: quiz.passingScore,
                order: quiz.order || 999 // Default order for quizzes
              });
            });
          } catch (quizError) {
            console.error('Error loading quizzes:', quizError);
          }
        }
        
        // Sort by order if available
        items.sort((a, b) => {
          if (a.order === undefined && b.order === undefined) return 0;
          if (a.order === undefined) return 1;
          if (b.order === undefined) return -1;
          return a.order - b.order;
        });
        
        setContentItems(items);
      } finally {
        setLoadingContent(false);
      }
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Không thể tải thông tin khóa học');
      toast.error('Không thể tải thông tin khóa học');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for user's progress and determine continuing point
  const checkUserProgress = async (courseId: string, progress: number) => {
    try {
      // Get ordered content
      const orderedContent = await courseService.getCourseContent(courseId);
      const contentArray = orderedContent as ContentItem[];
      
      if (contentArray.length === 0) return;
      
      // If progress is 0, return the first item
      if (progress === 0) {
        const firstItem = contentArray[0];
        setLastAccessedContent({
          type: firstItem.type,
          id: firstItem._id,
          title: firstItem.title || 'Bài học'
        });
        return;
      }
      
      // If progress is 100, all content is completed
      if (progress === 100) {
        // Return the last item for review
        const lastItem = contentArray[contentArray.length - 1];
        setLastAccessedContent({
          type: lastItem.type,
          id: lastItem._id,
          title: lastItem.title || 'Bài học'
        });
        return;
      }
      
      // Calculate which item corresponds to the progress percentage
      const progressIndex = Math.floor((progress / 100) * contentArray.length);
      const nextItem = contentArray[Math.min(progressIndex, contentArray.length - 1)];
      
      setLastAccessedContent({
        type: nextItem.type,
        id: nextItem._id,
        title: nextItem.title || 'Bài học'
      });
      
      console.log(`User progress: ${progress}%, continuing from item: ${nextItem.title}`);
      
    } catch (err) {
      console.error('Error determining continue point:', err);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [params.id, currentUserId]);

  const handleEnroll = async () => {
    if (!course) return;
    
    setIsEnrolling(true);
    try {
      await enrollmentService.enrollCourse(currentUserId, course._id);
      setIsEnrolled(true);
      setEnrollmentStatus('ENROLLED');
      setEnrollmentProgress(0);
      toast.success('Đăng ký khóa học thành công!');
      
      // Refresh the page to show updated UI
      await fetchCourse();
    } catch (err) {
      console.error('Enrollment error:', err);
      toast.error('Không thể đăng ký khóa học. Vui lòng thử lại sau.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const getFirstLessonUrl = () => {
    if (!course || !course.lessons || course.lessons.length === 0) {
      return null;
    }
    
    // Access course.lessons safely - check if it's array of objects or strings
    const firstLesson = course.lessons[0];
    const lessonId = typeof firstLesson === 'string' ? firstLesson : firstLesson._id;
    
    return `/courses/${course._id}/lesson/${lessonId}`;
  };
  
  const getContinueLearningUrl = () => {
    if (!lastAccessedContent) {
      return getFirstLessonUrl();
    }
    
    return `/courses/${course?._id}/${lastAccessedContent.type}/${lastAccessedContent.id}`;
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
    
    // First item is always accessible to enrolled users
    if (index === 0) return true;
    
    // Completed items are always accessible
    const isCompleted = index < completedItemsCount;
    if (isCompleted) return true;
    
    // Currently accessed item is accessible
    if (lastAccessedContent && lastAccessedContent.id === item._id) return true;
    
    // Check if all previous items are completed
    const previousItemsCompleted = contentItems
      .slice(0, index)
      .every((_, i) => i < completedItemsCount);
    
    return previousItemsCompleted;
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
                : 'Đăng ký khóa học này để truy cập vào toàn bộ nội dung.'}
            </p>
          </div>
          
          {!isEnrolled ? (
            <button 
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="mt-4 md:mt-0 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-70"
            >
              {isEnrolling ? 'Đang đăng ký...' : 'Đăng ký khóa học'}
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
                    // Calculate if this item should be marked as completed based on progress
                    const completedItemsCount = isEnrolled ? getCompletedItemCount(contentItems.length, enrollmentProgress) : 0;
                    const isCompleted = isEnrolled && index < completedItemsCount;
                    const isCurrentItem = lastAccessedContent && lastAccessedContent.id === item._id;
                    const isAccessible = isContentItemAccessible(
                      item,
                      index,
                      contentItems,
                      isEnrolled,
                      completedItemsCount,
                      lastAccessedContent
                    );
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center p-4 rounded-lg border ${
                          isEnrolled && isAccessible
                            ? 'hover:bg-gray-50 cursor-pointer' 
                            : 'bg-gray-50 cursor-not-allowed opacity-70'
                        }`}
                        onClick={() => {
                          if (!isEnrolled) {
                            toast.error('Bạn cần đăng ký khóa học để truy cập nội dung');
                            return;
                          }
                          
                          if (!isAccessible) {
                            toast.error('Bạn cần hoàn thành các nội dung trước để mở khóa nội dung này');
                            return;
                          }
                          
                          if (item.type === 'lesson') {
                            router.push(`/courses/${course?._id}/lesson/${item._id}`);
                          } else {
                            router.push(`/courses/${course?._id}/quiz/${item._id}`);
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
                              {item.questions?.length || 0} câu hỏi • Điểm đạt: {item.passingScore || 70}%
                            </p>
                          )}
                        </div>
                        
                        {!isEnrolled && (
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
                            
                            {isCurrentItem && !isCompleted && (
                              <div className="ml-4 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                Đang học
                              </div>
                            )}
                            
                            {isEnrolled && !isAccessible && !isCompleted && !isCurrentItem && (
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Thông tin khóa học</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="text-orange-500 mr-3" />
                  <span>Thời lượng: {course.totalDuration ? course.totalDuration : "Không xác định"}</span>
                </div>
                <div className="flex items-center">
                  <Users className="text-orange-500 mr-3" />
                  <span>{course.studentsEnrolled.length} học viên</span>
                </div>
                <div className="flex items-center">
                  <Star className="text-orange-500 mr-3" />
                  <span>Đánh giá: {course.rating}/5</span>
                </div>
              </div>
            </div>

            {/* Course Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Yêu cầu</h3>
              <ul className="space-y-2">
                {(course.requirements || []).map((req, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
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