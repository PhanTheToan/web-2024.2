"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FileText, Loader2, AlertCircle, 
  FileUp
} from "lucide-react";
import { toast } from "react-hot-toast";

// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

// Quiz types
enum QuizType {
  QUIZ_FORM_FULL = "QUIZ_FORM_FULL",
  QUIZ_FILL = "QUIZ_FILL",
}

// Course interface
interface Course {
  id: string;
  title: string;
  description?: string;
  teacherId?: string;
  teacherName?: string;
  // Add other course properties as needed
}

export default function CreateAIQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz type selection
  const [quizType, setQuizType] = useState<QuizType>(QuizType.QUIZ_FORM_FULL);
  
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
        
        // Continue with fetching course data
        fetchCourse();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        router.push('/login?redirect=/teacher/courses');
      }
    };
    
    checkAuth();
  }, [router, courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      console.log("Fetching course:", courseId);
      const response = await fetch(`${API_BASE_URL}/course/info-course/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Không thể tải thông tin khóa học");
      }

      const courseData = await response.json();
      let parsedCourse: Course;
      
      if (courseData.body) {
        parsedCourse = courseData.body;
      } else {
        parsedCourse = courseData;
      }
      
      console.log("Course data:", parsedCourse);
      setCourse(parsedCourse);
      
      // Fetch order information
      fetchLessonsAndQuizzes(courseId);
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch lessons and quizzes to determine next order
  const fetchLessonsAndQuizzes = async (courseId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/course/lesson_quiz/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách bài học và bài kiểm tra");
      }

      const data = await response.json();
      console.log("Lessons and quizzes data:", data);
      
      let maxOrder = 0;
      
      // Xử lý mảng lessons từ API
      const lessons = data.body?.lessons || [];
      if (Array.isArray(lessons)) {
        lessons.forEach(lesson => {
          if (lesson.orderLesson) {
            maxOrder = Math.max(maxOrder, lesson.orderLesson);
          }
        });
      }
      
      // Xử lý mảng quizzes từ API
      const quizzes = data.body?.quizzes || [];
      if (Array.isArray(quizzes)) {
        quizzes.forEach(quiz => {
          if (quiz.orderQuiz) {
            maxOrder = Math.max(maxOrder, quiz.orderQuiz);
          }
        });
      }
      
      // Đặt order quiz mới là maxOrder + 1
      const nextOrder = maxOrder + 1;
      console.log("Next order:", nextOrder);
    } catch (err) {
      console.error("Error fetching lessons and quizzes:", err);
      // Keep default order of 1
    }
  };
  
  // Handle file selection for PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      setError('Vui lòng chọn file PDF');
      toast.error('Vui lòng chọn file PDF');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file quá lớn (tối đa 10MB)');
      toast.error('Kích thước file quá lớn (tối đa 10MB)');
      return;
    }
    
    setPdfFile(file);
    setError(null);
  };
  
  // Generate quiz from PDF
  const generateQuiz = async () => {
    if (!pdfFile) {
      setError('Vui lòng chọn file PDF');
      toast.error('Vui lòng chọn file PDF');
      return;
    }
    
    try {
      setGeneratingQuiz(true);
      setError(null);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('files', pdfFile, pdfFile.name);
      console.log("Form data:", formData);
      
      // Build URL with query parameters
      const apiUrl = `${API_BASE_URL}/quiz/generate-from-pdf?courseId=${courseId}&type=${quizType}`;
      
      // Call the API endpoint
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      console.log("Response:", response);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Không thể tạo bài kiểm tra từ PDF');
      }
      
      const result = await response.json();
      console.log("Generated quiz result:", result);
      
      // Show success message
      toast.success('Đã tạo bài kiểm tra thành công!');
      
      // Redirect back to the course page immediately
      router.push(`/teacher/courses/${courseId}`);
      
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err instanceof Error ? err.message : 'Không thể tạo bài kiểm tra. Vui lòng thử lại sau.');
      toast.error('Không thể tạo bài kiểm tra từ PDF');
    } finally {
      setGeneratingQuiz(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Không tìm thấy thông tin khóa học.</span>
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header with breadcrumbs */}
      <div className="flex flex-wrap items-center gap-y-2 mb-6">
        <Link href="/teacher/courses" className="text-gray-500 hover:text-gray-700 mr-2">
          Khóa học của tôi
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href={`/teacher/courses/${courseId}`} className="text-gray-500 hover:text-gray-700 mr-2">
          {course.title}
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href={`/teacher/courses/${courseId}/quizzes`} className="text-gray-500 hover:text-gray-700 mr-2">
          Bài kiểm tra
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-900 font-medium">Tạo bài kiểm tra bằng AI</span>
      </div>
      
      {/* Back button */}
      <Link
        href={`/teacher/courses/${courseId}/quizzes`}
        className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách bài kiểm tra
      </Link>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <div className="flex">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Upload PDF Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Tạo bài kiểm tra bằng AI</h2>
        <p className="text-gray-600 mb-6">
          Tải lên tài liệu PDF và AI sẽ tự động tạo bài kiểm tra dựa trên nội dung.
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại bài kiểm tra
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  quizType === QuizType.QUIZ_FORM_FULL 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setQuizType(QuizType.QUIZ_FORM_FULL)}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    quizType === QuizType.QUIZ_FORM_FULL ? 'bg-indigo-500' : 'border border-gray-400'
                  }`}></div>
                  <h3 className="font-medium">Bài kiểm tra đầy đủ</h3>
                </div>
                <p className="text-gray-500 text-sm mt-2 ml-6">
                  Hiển thị đầy đủ câu hỏi, các lựa chọn và đáp án đúng. Phù hợp với bài kiểm tra trực tuyến.
                </p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  quizType === QuizType.QUIZ_FILL 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setQuizType(QuizType.QUIZ_FILL)}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    quizType === QuizType.QUIZ_FILL ? 'bg-purple-500' : 'border border-gray-400'
                  }`}></div>
                  <h3 className="font-medium">Phiếu trả lời</h3>
                </div>
                <p className="text-gray-500 text-sm mt-2 ml-6">
                  Chỉ hiển thị tài liệu, ẩn câu hỏi và đáp án. Phù hợp với bài kiểm tra dạng phiếu trả lời.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài liệu PDF <span className="text-red-500">*</span>
            </label>
            
            <div className="mt-1 flex items-center">
              <input
                type="file"
                id="pdf-upload"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <span className="flex items-center">
                  <FileUp className="h-4 w-4 mr-2" />
                  Chọn tệp PDF
                </span>
              </label>
              
              {pdfFile && (
                <div className="ml-3 p-2 bg-gray-100 rounded flex items-center">
                  <FileText className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    {pdfFile.name}
                  </span>
                </div>
              )}
            </div>
            
            <p className="mt-2 text-xs text-gray-500">
              Chỉ chấp nhận file PDF, kích thước tối đa 10MB.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={generateQuiz}
              disabled={!pdfFile || generatingQuiz}
              className={`bg-blue-700 text-white px-4 py-2 rounded-md flex items-center ${
                !pdfFile || generatingQuiz ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {generatingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo bài kiểm tra...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Tạo bài kiểm tra
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 