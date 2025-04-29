"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, List, Clock, Calendar, Award, 
  AlertCircle, Loader2, CheckCircle, X, Trash, HelpCircle,
  FileText
} from 'lucide-react';
import { Course } from '@/app/types';
import { toast } from 'react-hot-toast';
import dotenv from 'dotenv';
dotenv.config();
// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

// Enum cho loại câu hỏi
enum EQuestion {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

// Enum cho trạng thái quiz
enum QuizStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Add quiz type enum
enum QuizType {
  QUIZ_FORM_FULL = "QUIZ_FORM_FULL",
  QUIZ_FILL = "QUIZ_FILL",
}

// Định nghĩa interface cho question từ API
interface ApiQuizQuestion {
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  material?: string | null;
  eQuestion?: EQuestion;
  equestion?: EQuestion;
}

// Interface cho question sau khi đã xử lý
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string | string[];
  material?: string | null;
  equestion?: EQuestion;
}

// Type for dates that can be represented as arrays in the API response
type DateOrArray = string | Date | [number, number, number, number, number, number, number];

interface Quiz {
  _id: string;
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  order?: number;
  status?: QuizStatus;
  createdAt: string | Date | DateOrArray;
  updatedAt?: string | Date;
  material?: string | null;
  equiz?: string | null;
}

// Helper function to format API date (handles both string dates and array dates)
const formatApiDate = (apiDate: DateOrArray | undefined): string => {
  try {
    if (!apiDate) return 'N/A';
    
    let date: Date;
    
    // Handle array format [year, month, day, hour, minute, second, nano]
    if (Array.isArray(apiDate) && apiDate.length >= 7) {
      // Month in JS is 0-indexed, but API returns 1-indexed month
      date = new Date(apiDate[0], apiDate[1] - 1, apiDate[2], apiDate[3], apiDate[4], apiDate[5]);
    } else {
      // Handle string or Date object
      date = new Date(apiDate as string | Date);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

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
        console.log("Checking teacher authentication...");
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
        
        if (userData.role !== 'ROLE_TEACHER') {
          toast.error('Bạn không có quyền truy cập trang này');
          router.push('/login?redirect=/teacher/courses');
          return;
        }
        
        console.log("Authenticated teacher:", userData);
        
        // Continue with fetching data
        fetchData();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        router.push('/login?redirect=/teacher/courses');
      }
    };
    
    checkAuth();
  }, [router, courseId, quizId]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course data from API
      console.log("Fetching course:", courseId);
      const courseResponse = await fetch(`${API_BASE_URL}/course/info-course/${courseId}`, {
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
      
      // Fetch quiz data using the API
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
      
      // Xử lý dữ liệu quiz từ API
      const parsedQuiz: Quiz = {
        _id: quizData._id || quizData.id,
        id: quizData.id,
        courseId: quizData.courseId,
        title: quizData.title,
        description: quizData.description === "null" ? "" : quizData.description,
        questions: (quizData.questions || []).map((q: ApiQuizQuestion) => {
          // Ensure correctAnswer is always an array
          let correctAnswerArray: string[] = [];
          if (Array.isArray(q.correctAnswer)) {
            correctAnswerArray = [...q.correctAnswer];
          } else if (q.correctAnswer) {
            correctAnswerArray = [q.correctAnswer as string];
          }
          
          // Ensure options is always an array (may be empty for SHORT_ANSWER)
          const options = Array.isArray(q.options) ? [...q.options] : [];
          
          // Handle eQuestion field (API uses eQuestion, frontend may use equestion)
          const questionType = q.eQuestion || q.equestion || EQuestion.SINGLE_CHOICE;
          
          return {
            question: q.question,
            options: options,
            correctAnswer: correctAnswerArray,
            material: q.material || null,
            equestion: questionType  // Use equestion as the main field for question type
          };
        }),
        passingScore: quizData.passingScore,
        timeLimit: quizData.timeLimit,
        order: quizData.order,
        status: quizData.status,
        createdAt: quizData.createdAt,
        material: quizData.material,
        equiz: quizData.equiz || null
      };
      
      setQuiz(parsedQuiz);
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
      router.push(`/teacher/courses/${courseId}`);
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
        <Link href={`/teacher/courses/${courseId}`} className="text-primary-600 hover:text-primary-800 flex items-center">
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
        <Link href="/teacher/courses" className="text-primary-600 hover:text-primary-800 flex items-center">
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
        <Link href="/teacher/courses" className="text-gray-500 hover:text-gray-700 mr-2">
          Quản lý khóa học
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href={`/teacher/courses/${courseId}`} className="text-gray-500 hover:text-gray-700 mr-2">
          {course.title}
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-900 font-medium">Bài kiểm tra: {quiz.title}</span>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại khóa học
        </Link>
        
        <div className="flex space-x-3">
          <Link
            href={`/teacher/courses/${courseId}/quizzes/${quizId}/edit`}
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
            Xóa bài kiểm tra
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column - Quiz info - Mở rộng thành 3/4 */}
        <div className="lg:col-span-3">
          {/* Quiz info cards */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{quiz.title}</h2>
                  <p className="text-gray-500 mt-1">{quiz.description || 'Không có mô tả'}</p>
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    quiz.status === QuizStatus.ACTIVE 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {quiz.status === QuizStatus.ACTIVE ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                  </span>
                </div>
              </div>
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
                  <p className="font-medium">{formatApiDate(quiz.createdAt)}</p>
                </div>
              </div>
            </div>
            
            {/* Display quiz main material (PDF) if available */}
            {quiz.material && (
              <div className="p-4 border-t">
                <h3 className="text-md font-medium mb-3">Tài liệu bài kiểm tra:</h3>
                <div className="w-full rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={`${quiz.material}#toolbar=0&navpanes=0&scrollbar=0`}
                    width="100%"
                    height="600px"
                    className="border-0"
                    title="Tài liệu bài kiểm tra"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-3 flex justify-end">
                  <a 
                    href={quiz.material} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 inline-flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Mở PDF toàn màn hình
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Questions list */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Câu hỏi ({quiz.questions.length})</h3>
              {quiz.equiz && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  quiz.equiz === QuizType.QUIZ_FORM_FULL 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {quiz.equiz === QuizType.QUIZ_FORM_FULL ? 'Bài kiểm tra đầy đủ' : 'Phiếu trả lời'}
                </span>
              )}
            </div>
            
            {quiz.questions.length > 0 ? (
              quiz.equiz === QuizType.QUIZ_FILL ? (
                // QUIZ_FILL format (answer sheet style)
                <div className="p-6">
                  <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left column - Quiz material (3/4 width) */}
                    <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg">
                      <div className="p-4 border-b bg-gray-50">
                        <h4 className="text-lg font-medium">Đề bài</h4>
                      </div>
                      
                      <div className="p-4">
                        {quiz.material ? (
                          <div className="w-full rounded-lg overflow-hidden border border-gray-200 h-[calc(100vh-250px)] min-h-[600px]">
                            <iframe
                              src={`${quiz.material}#toolbar=0&navpanes=0&scrollbar=0`}
                              width="100%"
                              height="100%"
                              className="border-0"
                              title="Tài liệu bài kiểm tra"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-500">Không có tài liệu đính kèm</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right column - Answer sheet (1/4 width) */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg">
                      <div className="p-3 border-b bg-gray-50">
                        <h4 className="text-base font-medium">Phiếu trả lời</h4>
                        <p className="text-xs text-gray-500 mt-1">{quiz.description || 'Không có mô tả'}</p>
                      </div>
                      
                      <div className="p-3">
                        {/* Layout phiếu trả lời - câu hỏi dạng dọc */}
                        <div className="space-y-2 mb-6 max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
                          {quiz.questions.map((question, index) => {
                            // Get the options and correct answers
                            const options = question.options || [];
                            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
                            
                            // Map options to letters A, B, C, D
                            const optionLetters = ['A', 'B', 'C', 'D'];
                            
                            return (
                              <div key={index} className="border border-red-200 rounded-md p-1.5 flex items-center">
                                <div className="text-red-600 font-medium min-w-[24px] text-center text-xs">
                                  {index + 1}.
                                </div>
                                <div className="flex space-x-2 ml-1">
                                  {optionLetters.slice(0, options.length).map((letter, letterIdx) => {
                                    const option = options[letterIdx] || '';
                                    // Compare by option value, not by index
                                    const isCorrect = correctAnswers.includes(option);
                                    
                                    return (
                                      <div 
                                        key={letter} 
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                          isCorrect
                                            ? 'bg-green-500 text-white border border-green-500'
                                            : 'border border-gray-300 text-gray-700'
                                        }`}
                                        title={option} // Show option text on hover
                                      >
                                        {letter}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Question-specific materials */}
                  {quiz.questions.some(q => q.material) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium mb-3">Tài liệu tham khảo cho câu hỏi:</h5>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {quiz.questions.map((question, index) => (
                          question.material && (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <div className="border-b px-3 py-2 bg-gray-50 flex items-center">
                                <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                  {index + 1}
                                </span>
                                <span className="text-sm font-medium">Tài liệu cho câu hỏi {index + 1}</span>
                              </div>
                              <div className="p-4 flex justify-center">
                                {question.material.endsWith('.pdf') ? (
                                  <div className="w-full">
                                    <iframe
                                      src={`${question.material}#toolbar=0&navpanes=0&scrollbar=0`}
                                      width="100%"
                                      height="400px"
                                      className="border-0"
                                      title={`Tài liệu cho câu hỏi ${index + 1}`}
                                      allowFullScreen
                                    ></iframe>
                                    <div className="mt-2 flex justify-end">
                                      <a 
                                        href={question.material} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 inline-flex items-center text-sm"
                                      >
                                        <FileText className="w-3 h-3 mr-1" />
                                        Mở PDF toàn màn hình
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <img 
                                    src={question.material} 
                                    alt={`Tài liệu cho câu hỏi ${index + 1}`}
                                    className="max-h-64 rounded"
                                  />
                                )}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Default QUIZ_FORM_FULL format (showing all question details)
                <div className="divide-y">
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start mb-3">
                        <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{question.question}</h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {question.equestion === EQuestion.SINGLE_CHOICE ? 'Chọn một đáp án' : 
                            question.equestion === EQuestion.MULTIPLE_CHOICE ? 'Chọn nhiều đáp án' : 
                            question.equestion === EQuestion.SHORT_ANSWER ? 'Câu trả lời ngắn' : 'Trắc nghiệm'}
                          </div>
                        </div>
                      </div>
                      
                      {question.material && (
                        <div className="pl-8 mb-3">
                          {question.material.endsWith('.pdf') ? (
                            <div className="w-full mb-2">
                              <iframe
                                src={`${question.material}#toolbar=0&navpanes=0&scrollbar=0`}
                                width="100%"
                                height="400px"
                                className="border rounded"
                                title={`Tài liệu cho câu hỏi ${index + 1}`}
                                allowFullScreen
                              ></iframe>
                              <div className="mt-2 flex justify-end">
                                <a 
                                  href={question.material} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 inline-flex items-center text-sm"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Mở PDF trong tab mới
                                </a>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={question.material} 
                              alt={`Hình ảnh cho câu hỏi ${index + 1}`} 
                              className="max-h-64 rounded-md border border-gray-200"
                            />
                          )}
                        </div>
                      )}
                      
                      <div className="pl-8 space-y-2">
                        {question.equestion === EQuestion.SHORT_ANSWER ? (
                          // Hiển thị câu trả lời ngắn
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                            <h5 className="font-medium text-sm text-blue-700 mb-2">Các đáp án được chấp nhận:</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {Array.isArray(question.correctAnswer) ? 
                                question.correctAnswer.map((answer, idx) => (
                                  <li key={idx} className="text-blue-800">{answer}</li>
                                )) : 
                                <li className="text-blue-800">{question.correctAnswer}</li>
                              }
                            </ul>
                          </div>
                        ) : question.equestion === EQuestion.SINGLE_CHOICE || question.equestion === EQuestion.MULTIPLE_CHOICE ? (
                          // Hiển thị câu hỏi một lựa chọn hoặc nhiều lựa chọn
                          <>
                            {question.options.map((option, optionIndex) => {
                              // Compare by option value, not by index
                              const isCorrect = Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer.includes(option) 
                                : option === question.correctAnswer;
                              
                              return (
                                <div 
                                  key={optionIndex} 
                                  className={`p-2 rounded-md flex items-center ${
                                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                  ) : (
                                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                  )}
                                  <span className={isCorrect ? 'font-medium' : ''}>{option}</span>
                                  {isCorrect && (
                                    <span className="ml-2 text-xs text-green-600 font-medium">Đáp án đúng</span>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          // Hiển thị mặc định cho trường hợp không xác định được loại câu hỏi
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                            <p className="text-yellow-700">Loại câu hỏi không xác định</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="p-6 text-center text-gray-500">
                <HelpCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" />
                <p>Chưa có câu hỏi nào cho bài kiểm tra này</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Sidebar - Thu nhỏ còn 1/4 */}
        <div className="lg:col-span-1">
          {/* Course info */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-3 border-b">
              <h3 className="text-base font-bold">Thuộc khóa học</h3>
            </div>
            <div className="p-3">
              <Link 
                href={`/teacher/courses/${courseId}`}
                className="text-primary-600 hover:text-primary-800 font-medium text-sm"
              >
                {course.title}
              </Link>
              <p className="text-gray-500 mt-1 text-sm">
                Số bài kiểm tra: {Array.isArray(course.quizzes) ? course.quizzes.length : 0}
              </p>
            </div>
          </div>
          
          {/* Quiz statistics (placeholder for future development) */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b">
              <h3 className="text-base font-bold">Thống kê bài kiểm tra</h3>
            </div>
            <div className="p-3">
              <p className="text-gray-500 mb-2 text-sm">Tính năng thống kê sẽ được phát triển trong tương lai, bao gồm:</p>
              <ul className="list-disc pl-5 text-gray-500 space-y-1 text-sm">
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