"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Trash, Clock, Calendar, 
  AlertCircle, Loader2, CheckCircle, X, 
  List, Award, HelpCircle
} from 'lucide-react';
import { Course } from '@/app/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

// Define Quiz-related types based on API response
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  material?: string | null;
}

interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  order?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking admin authentication...");
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Bạn cần đăng nhập để tiếp tục');
        }
        
        const data = await response.json();
        const userData = data.data;
        
        if (userData.role !== 'ROLE_ADMIN') {
          toast.error('Bạn không có quyền truy cập trang này');
          router.push('/login?redirect=/admin/couserscontrol');
          return;
        }
        
        console.log("Authenticated admin:", userData);
        
        // Continue with fetching data
        fetchData();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        router.push('/login?redirect=/admin/couserscontrol');
      }
    };
    
    checkAuth();
  }, [router]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course data from API
      console.log("Fetching course:", courseId);
      const courseResponse = await fetch(`${API_BASE_URL}/course/info/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!courseResponse.ok) {
        throw new Error("Failed to fetch course");
      }

      const courseData = await courseResponse.json();
      let parsedCourse;
      
      if (courseData.body) {
        parsedCourse = courseData.body;
      } else {
        parsedCourse = courseData;
      }
      
      console.log("Course data:", parsedCourse);
      setCourse(parsedCourse);
      
      // Fetch quiz data using the API from screenshot
      console.log("Fetching quiz:", quizId);
      const quizResponse = await fetch(`${API_BASE_URL}/course/get-quiz/${quizId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!quizResponse.ok) {
        throw new Error("Failed to fetch quiz");
      }

      const quizData = await quizResponse.json();
      console.log("Quiz data:", quizData);
      
      setQuiz(quizData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteQuiz = async () => {
    if (!course || !quiz) return;
    
    try {
      setDeleting(true);
      
      // Delete the quiz using the API
      const response = await fetch(`${API_BASE_URL}/course/delete-quiz/${quizId}?courseId=${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete quiz error:', errorText);
        throw new Error('Không thể xóa bài kiểm tra');
      }
      
      toast.success('Đã xóa bài kiểm tra thành công');
      
      // Redirect after successful deletion
      router.push(`/admin/couserscontrol/${courseId}`);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      setError('Không thể xóa bài kiểm tra. Vui lòng thử lại sau.');
      setDeleteModalOpen(false);
      toast.error('Không thể xóa bài kiểm tra');
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
        <Link href={`/admin/couserscontrol/${courseId}`} className="text-primary-600 hover:text-primary-800 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại khóa học
        </Link>
      </div>
    );
  }
  
  if (!course || !quiz) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Không tìm thấy dữ liệu bài kiểm tra hoặc khóa học.</span>
          </div>
        </div>
        <Link href="/admin/couserscontrol" className="text-primary-600 hover:text-primary-800 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with breadcrumbs */}
      <div className="flex flex-wrap items-center gap-y-2 mb-6">
        <Link href="/admin/couserscontrol" className="text-gray-500 hover:text-gray-700 mr-2">
          Quản lý khóa học
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href={`/admin/couserscontrol/${courseId}`} className="text-gray-500 hover:text-gray-700 mr-2">
          {course.title}
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-900 font-medium">Bài kiểm tra: {quiz.title}</span>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href={`/admin/couserscontrol/${courseId}`}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại khóa học
        </Link>
        
        <div className="flex space-x-3">
          <Link
            href={`/admin/couserscontrol/${courseId}/quizzes/${quizId}/edit`}
            className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
          
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700"
          >
            <Trash className="w-4 h-4 mr-2" />
            Xóa kiểm tra
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Quiz info */}
        <div className="lg:col-span-2">
          {/* Quiz info cards */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b p-4">
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <p className="text-gray-500 mt-1">{quiz.description || 'Không có mô tả'}</p>
            </div>
            
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <List className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Số câu hỏi</p>
                  <p className="font-medium">{quiz.questions.length}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Thời gian làm bài</p>
                  <p className="font-medium">{quiz.timeLimit ? `${quiz.timeLimit} phút` : 'Không giới hạn'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Award className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Điểm đạt</p>
                  <p className="font-medium">{quiz.passingScore}%</p>
                </div>
              </div>
              
              <div className="flex items-center md:col-span-3">
                <Calendar className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="font-medium">{formatDate(quiz.createdAt.toString())}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Questions list */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Câu hỏi ({quiz.questions.length})</h3>
            </div>
            
            {quiz.questions.length > 0 ? (
              <div className="divide-y">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start mb-3">
                      <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <h4 className="font-medium">{question.question}</h4>
                    </div>
                    
                    <div className="pl-8 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                          className={`p-2 rounded-md flex items-center ${
                            option === question.correctAnswer 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {option === question.correctAnswer ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          )}
                          <span>{option}</span>
                          {option === question.correctAnswer && (
                            <span className="ml-2 text-xs text-green-600 font-medium">Đáp án đúng</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <HelpCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" />
                <p>Chưa có câu hỏi nào cho bài kiểm tra này</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Sidebar */}
        <div className="lg:col-span-1">
          {/* Course info */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Thuộc khóa học</h3>
            </div>
            <div className="p-4">
              <Link 
                href={`/admin/couserscontrol/${courseId}`}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                {course.title}
              </Link>
              <p className="text-gray-500 mt-1">
                Số bài kiểm tra: {Array.isArray(course.quizzes) ? course.quizzes.length : 0}
              </p>
            </div>
          </div>
          
          {/* Quiz statistics (placeholder for future development) */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Thống kê bài kiểm tra</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-500 mb-2">Tính năng thống kê sẽ được phát triển trong tương lai, bao gồm:</p>
              <ul className="list-disc pl-5 text-gray-500 space-y-1">
                <li>Số lượng học viên đã tham gia</li>
                <li>Tỷ lệ học viên vượt qua bài kiểm tra</li>
                <li>Câu hỏi khó nhất/dễ nhất</li>
                <li>Điểm trung bình</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bài kiểm tra <span className="font-semibold">{quiz.title}</span>? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteQuiz}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4 mr-2" />
                    Xóa bài kiểm tra
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 