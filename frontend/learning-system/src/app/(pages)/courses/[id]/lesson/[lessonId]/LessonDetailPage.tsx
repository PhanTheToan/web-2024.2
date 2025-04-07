"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import { Lesson, Course } from "@/app/types";
import { lessonService } from "@/services/lessonService";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Check, FileText, PlayCircle, Download, Eye, ExternalLink } from "lucide-react";

const LessonDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

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
        
        setCourse(courseData as Course);
        setLesson(lessonData);
        
        // Check if user is enrolled
        if (!enrollment) {
          // Redirect to course page if not enrolled
          toast.error('Bạn cần đăng ký khóa học trước khi học');
          router.push(`/courses/${courseId}`);
          return;
        }
        
        // Find the current lesson index in the course lessons
        if (courseData && lessonData) {
          // Get the full lessons list for this course
          const courseLessons = await lessonService.getLessonsByCourseId(courseId);
          
          // Sort by order
          const orderedLessons = courseLessons.sort((a, b) => a.order - b.order);
          
          // Find current lesson index
          const currentIndex = orderedLessons.findIndex(l => l._id === lessonId);
          
          // Set previous and next lessons
          if (currentIndex > 0) {
            setPrevLesson(orderedLessons[currentIndex - 1]);
          } else {
            setPrevLesson(null);
          }
          
          if (currentIndex < orderedLessons.length - 1) {
            setNextLesson(orderedLessons[currentIndex + 1]);
          } else {
            setNextLesson(null);
          }
          
          // Mark lessons before current as completed
          const completed = new Set<string>();
          orderedLessons.forEach((l, idx) => {
            if (idx < currentIndex) {
              completed.add(l._id);
            }
          });
          setCompletedLessons(completed);
          
          // Update enrollment progress automatically when accessing a lesson
          const progress = Math.round(((currentIndex + 1) / orderedLessons.length) * 100);
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

  const handleMarkComplete = async () => {
    if (!lesson || !course) return;
    
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
      
      // If this is the last lesson, mark the course as complete
      if (!nextLesson && progress >= 100) {
        await enrollmentService.markCourseComplete(currentUserId, courseId);
        toast.success('Chúc mừng! Bạn đã hoàn thành khóa học!');
        router.push(`/courses/${courseId}`);
        return;
      }
      
      toast.success('Đã đánh dấu hoàn thành bài học');
      
      // Navigate to next lesson if available
      if (nextLesson) {
        router.push(`/courses/${courseId}/lesson/${nextLesson._id}`);
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
              {course.duration || "30 phút"}
            </span>
          </div>
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
                {course.lessons.map((lessonItem, index) => (
                  <Link
                    key={index}
                    href={`/courses/${courseId}/lesson/${lessonItem._id}`}
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      lessonItem._id === lesson._id 
                        ? 'bg-primary-50 border-l-4 border-primary-600' 
                        : completedLessons.has(lessonItem._id)
                          ? 'bg-green-50 hover:bg-green-100'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      completedLessons.has(lessonItem._id) 
                        ? 'bg-green-500 text-white' 
                        : lessonItem._id === lesson._id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200'
                    }`}>
                      {completedLessons.has(lessonItem._id) 
                        ? <Check className="w-4 h-4" /> 
                        : index + 1
                      }
                    </div>
                    <div>
                      <div className={`font-medium ${
                        lessonItem._id === lesson._id ? 'text-primary-700' : ''
                      }`}>
                        {lessonItem.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lessonItem.description && lessonItem.description.substring(0, 30)}
                        {lessonItem.description && lessonItem.description.length > 30 ? '...' : ''}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">
                  Tiến độ khóa học: {Math.round((completedLessons.size / course.lessons.length) * 100)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(completedLessons.size / course.lessons.length) * 100}%` }}
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
              {prevLesson ? (
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
                ) : nextLesson ? (
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

              {nextLesson ? (
                <Link
                  href={`/courses/${courseId}/lesson/${nextLesson._id}`}
                  className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 flex items-center justify-center sm:justify-end"
                >
                  <span>Bài tiếp theo</span>
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
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