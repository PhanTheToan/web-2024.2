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
import { BookOpen, Clock, Users, Star, CheckCircle, ClipboardCheck } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define Quiz interface
interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  passingScore: number;
  createdAt: Date;
}

const DetailCoursePage: React.FC = () => {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState<number>(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const router = useRouter();

  // Mock user ID for demonstration - in a real app, this would come from authentication
  const currentUserId = 'student1';

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const courseId = params.id as string;
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);
        
        // Check if user is enrolled
        const enrollment = await enrollmentService.getEnrollment(currentUserId, courseId);
        if (enrollment) {
          setIsEnrolled(true);
          setEnrollmentStatus(enrollment.status);
          setEnrollmentProgress(enrollment.progress);
        }

        // Fetch quiz details if the course has quizzes
        if (courseData.quizzes && courseData.quizzes.length > 0) {
          setLoadingQuizzes(true);
          try {
            const quizzesData = await quizService.getQuizzesByCourseId(courseId);
            setQuizzes(quizzesData);
          } catch (quizError) {
            console.error('Error fetching quizzes:', quizError);
          } finally {
            setLoadingQuizzes(false);
          }
        }
      } catch {
        setError('Không thể tải thông tin khóa học');
        toast.error('Không thể tải thông tin khóa học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  const handleEnroll = async () => {
    if (!course) return;
    
    setIsEnrolling(true);
    try {
      await enrollmentService.enrollCourse(currentUserId, course._id);
      setIsEnrolled(true);
      setEnrollmentStatus('ENROLLED');
      setEnrollmentProgress(0);
      toast.success('Đăng ký khóa học thành công!');
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
    return `/courses/${course._id}/lesson/${course.lessons[0]._id}`;
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
        <CourseItem course={course} />
        
        {/* Call to Action Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Bắt đầu hành trình học tập của bạn ngay hôm nay!</h3>
            <p className="text-gray-600">Đăng ký khóa học này để truy cập vào toàn bộ nội dung.</p>
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
                href={getFirstLessonUrl() || '#'} 
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                {enrollmentStatus === 'ENROLLED' ? 'Bắt đầu học' : 'Tiếp tục học'}
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

            {/* Course content */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
              
              {/* Lessons section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Bài học</h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-4 rounded-lg border ${
                        isEnrolled 
                          ? 'hover:bg-gray-50 cursor-pointer' 
                          : 'bg-gray-50 cursor-not-allowed opacity-70'
                      }`}
                      onClick={() => {
                        if (isEnrolled) {
                          router.push(`/courses/${course._id}/lesson/${lesson._id}`);
                        } else {
                          toast.error('Bạn cần đăng ký khóa học để truy cập bài học');
                        }
                      }}
                    >
                      <div className="mr-4">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.description}</p>
                      </div>
                      {!isEnrolled && (
                        <div className="ml-4 text-sm text-red-600">
                          Cần đăng ký
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quizzes section */}
              {quizzes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bài kiểm tra</h3>
                  <div className="space-y-2">
                    {loadingQuizzes ? (
                      <div className="p-4 text-center">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ) : (
                      quizzes.map((quiz, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-4 rounded-lg border ${
                            isEnrolled 
                              ? 'hover:bg-gray-50 cursor-pointer' 
                              : 'bg-gray-50 cursor-not-allowed opacity-70'
                          }`}
                          onClick={() => {
                            if (isEnrolled) {
                              router.push(`/courses/${course?._id}/quiz/${quiz._id}`);
                            } else {
                              toast.error('Bạn cần đăng ký khóa học để làm bài kiểm tra');
                            }
                          }}
                        >
                          <div className="mr-4">
                            <ClipboardCheck className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium">{quiz.title}</h4>
                            <p className="text-sm text-gray-500">
                              {quiz.questions.length} câu hỏi • Điểm đạt: {quiz.passingScore}%
                            </p>
                          </div>
                          {!isEnrolled && (
                            <div className="ml-4 text-sm text-red-600">
                              Cần đăng ký
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
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
                  <span>Thời lượng: {course.duration}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailCoursePage;