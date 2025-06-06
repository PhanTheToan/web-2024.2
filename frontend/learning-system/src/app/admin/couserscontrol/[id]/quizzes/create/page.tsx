"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, MinusCircle, Save, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Course, EQuestion, QuizStatus } from "@/app/types";
import { toast } from "react-hot-toast";
import dotenv from 'dotenv';
dotenv.config();
// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

// Add quiz type enum
enum QuizType {
  QUIZ_FORM_FULL = "QUIZ_FORM_FULL",
  QUIZ_FILL = "QUIZ_FILL",
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string[];
  material: string | null;
  equestion: EQuestion;
}

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([{
    question: "",
    options: [""],
    correctAnswer: [],
    material: null,
    equestion: EQuestion.SINGLE_CHOICE
  }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [questionErrors, setQuestionErrors] = useState<Record<number, string>>({});
  
  const [orderInfo, setOrderInfo] = useState<{
    maxOrder: number;
    maxLessonOrder: number;
    maxQuizOrder: number;
    nextOrder: number;
  }>({ maxOrder: 0, maxLessonOrder: 0, maxQuizOrder: 0, nextOrder: 1 });
  const [uploadingImage, setUploadingImage] = useState<Record<number, boolean>>({});
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Quiz information state
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    timeLimit: 30, // in minutes
    passingScore: 70, // percentage
    order: 1,
    status: QuizStatus.INACTIVE, // Default to inactive
    equiz: QuizType.QUIZ_FORM_FULL, // Default quiz type
    material: null as string | null,
  });

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
        
        // Continue with fetching course data
        fetchCourse();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        router.push('/login?redirect=/admin/couserscontrol');
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching course:", courseId);
      const response = await fetch(`${API_BASE_URL}/course/info-course/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      const courseData = await response.json();
      let parsedCourse;
      
      if (courseData.body) {
        parsedCourse = courseData.body;
      } else {
        parsedCourse = courseData;
      }
      
      console.log("Course data:", parsedCourse);
      setCourse(parsedCourse);
      
      // Sau khi lấy thông tin khóa học, lấy danh sách bài học và quiz
      fetchLessonsAndQuizzes(courseId);
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hàm để lấy danh sách bài học và quiz để xác định thứ tự mới
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
        throw new Error("Failed to fetch lessons and quizzes");
      }

      const data = await response.json();
      console.log("Lessons and quizzes data:", data);
      
      let maxOrder = 0;
      let maxLessonOrder = 0;
      let maxQuizOrder = 0;
      
      // Xử lý mảng lessons từ API
      const lessons = data.body?.lessons || [];
      if (Array.isArray(lessons)) {
        lessons.forEach(lesson => {
          if (lesson.orderLesson && lesson.orderLesson > maxLessonOrder) {
            maxLessonOrder = lesson.orderLesson;
          }
          // Update the overall max order
          if (lesson.orderLesson) {
            maxOrder = Math.max(maxOrder, lesson.orderLesson);
          }
        });
      }
      
      // Xử lý mảng quizzes từ API
      const quizzes = data.body?.quizzes || [];
      if (Array.isArray(quizzes)) {
        quizzes.forEach(quiz => {
          if (quiz.orderQuiz && quiz.orderQuiz > maxQuizOrder) {
            maxQuizOrder = quiz.orderQuiz;
          }
          // Update the overall max order
          if (quiz.orderQuiz) {
            maxOrder = Math.max(maxOrder, quiz.orderQuiz);
          }
        });
      }
      
      // Đặt order quiz mới là maxOrder + 1
      const nextOrder = maxOrder + 1;
      setOrderInfo({
        maxOrder,
        maxLessonOrder,
        maxQuizOrder,
        nextOrder
      });

      // Update quizInfo with the next order value
      setQuizInfo(prev => ({
        ...prev,
        order: nextOrder
      }));

      console.log("Quiz order set to next available value:", nextOrder);
    } catch (err) {
      console.error("Error fetching lessons and quizzes:", err);
      // Set order to 1 if we can't get course content
      setQuizInfo(prev => ({
        ...prev,
        order: 1
      }));
    }
  };

  // Handle image upload for questions
  const handleImageUpload = async (questionIndex: number, file: File) => {
    if (!file) return;
    
    // Kiểm tra kích thước file (<= 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setQuestionErrors({
        ...questionErrors,
        [questionIndex]: "Kích thước file quá lớn, vui lòng chọn file nhỏ hơn 5MB"
      });
      return;
    }
    
    // Kiểm tra loại file (chỉ chấp nhận ảnh)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setQuestionErrors({
        ...questionErrors,
        [questionIndex]: "Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)"
      });
      return;
    }
    
    try {
      // Đánh dấu đang upload cho câu hỏi này
      setUploadingImage(prev => ({ ...prev, [questionIndex]: true }));
      
      // Tạo form-data theo đúng cấu trúc API yêu cầu
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading image with formData key "image"');
      
      // Sử dụng API upload ảnh đúng endpoint
      const response = await fetch(`${API_BASE_URL}/upload/image/r2`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải lên hình ảnh');
      }
      
      // Đọc response dạng text thay vì JSON vì API trả về URL trực tiếp
      const imageUrl = await response.text();
      console.log('Image URL received:', imageUrl);
      
      // Kiểm tra URL hợp lệ
      if (!imageUrl || !imageUrl.trim() || !isValidUrl(imageUrl)) {
        console.error('Invalid image URL:', imageUrl);
        throw new Error('Không nhận được URL hình ảnh hợp lệ từ API');
      }
      
      // Cập nhật material cho câu hỏi với URL
      handleQuestionChange(questionIndex, 'material', imageUrl);
      
      // Xóa lỗi nếu có
      if (questionErrors[questionIndex]) {
        const newErrors = {...questionErrors};
        delete newErrors[questionIndex];
        setQuestionErrors(newErrors);
      }
      
      toast.success('Tải lên hình ảnh thành công');
    } catch (err) {
      console.error('Error uploading image:', err);
      setQuestionErrors({
        ...questionErrors,
        [questionIndex]: "Không thể tải lên hình ảnh. Vui lòng thử lại sau."
      });
    } finally {
      // Kết thúc trạng thái đang upload
      setUploadingImage(prev => ({ ...prev, [questionIndex]: false }));
    }
  };
  
  // Hàm kiểm tra URL hợp lệ
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Hàm xóa hình ảnh
  const removeImage = (questionIndex: number) => {
    handleQuestionChange(questionIndex, 'material', '');
    toast.success('Đã xóa hình ảnh');
  };

  const handleQuestionChange = (index: number, field: string, value: string | string[] | EQuestion) => {
    const newQuestions = [...questions];
    
    // Type assertion for updating the specific field
    if (field === 'equestion') {
      const oldType = newQuestions[index].equestion;
      const newType = value as EQuestion;
      
      newQuestions[index].equestion = newType;
      
      // Reset correct answers when changing question types
      if (oldType !== newType) {
        // For SHORT_ANSWER, initialize with an empty array
        if (newType === EQuestion.SHORT_ANSWER) {
          newQuestions[index].correctAnswer = [];
          // We'll maintain the options even though they won't be displayed
          newQuestions[index].options = [];
        } 
        // For SINGLE_CHOICE, initialize with the first option
        else if (newType === EQuestion.SINGLE_CHOICE) {
          newQuestions[index].correctAnswer = newQuestions[index].options.length > 0 ? ['0'] : [];
          // Ensure we have at least one option
          if (newQuestions[index].options.length === 0) {
            newQuestions[index].options = [''];
          }
        }
        // For MULTIPLE_CHOICE, initialize with an empty array
        else if (newType === EQuestion.MULTIPLE_CHOICE) {
          newQuestions[index].correctAnswer = [];
          // Ensure we have at least one option
          if (newQuestions[index].options.length === 0) {
            newQuestions[index].options = [''];
          }
        }
      }
    } else if (field === 'question') {
      newQuestions[index].question = value as string;
    } else if (field === 'material') {
      newQuestions[index].material = value as string;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value as string[];
    } else if (field === 'options') {
      newQuestions[index].options = value as string[];
    }
    
    setQuestions(newQuestions);
    
    // Clear error for this question if it exists
    if (questionErrors[index]) {
      const newErrors = {...questionErrors};
      delete newErrors[index];
      setQuestionErrors(newErrors);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      question: "", 
      options: [""], // Start with one empty option for choice questions
      correctAnswer: [], 
      material: null, 
      equestion: EQuestion.SINGLE_CHOICE 
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
      
      // Update question errors
      const newErrors: Record<number, string> = {};
      Object.keys(questionErrors).forEach(key => {
        const questionIndex = parseInt(key);
        if (questionIndex < index) {
          newErrors[questionIndex] = questionErrors[questionIndex];
        } else if (questionIndex > index) {
          newErrors[questionIndex - 1] = questionErrors[questionIndex];
        }
      });
      setQuestionErrors(newErrors);
    }
  };

  const validateQuestions = (): boolean => {
    const errors: Record<number, string> = {};
    let isValid = true;

    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors[index] = "Câu hỏi không được để trống";
        isValid = false;
        return;
      }

      // Kiểm tra đáp án đúng
      if (question.equestion === EQuestion.SHORT_ANSWER) {
        // Đối với câu trả lời ngắn, cần có ít nhất một đáp án
        if (!question.correctAnswer || question.correctAnswer.length === 0 || 
            question.correctAnswer.every(ans => !ans.trim())) {
          errors[index] = "Phải có ít nhất một đáp án được chấp nhận cho câu hỏi trả lời ngắn";
          isValid = false;
        }
      } else {
        // Nếu là câu hỏi trắc nghiệm (SINGLE_CHOICE hoặc MULTIPLE_CHOICE)
        // Đếm số lựa chọn có nội dung
        const validOptions = question.options.filter(option => option.trim());

        if (validOptions.length < 1) {
          errors[index] = "Câu hỏi trắc nghiệm phải có ít nhất 1 lựa chọn";
          isValid = false;
          return;
        }

        // Kiểm tra xem đáp án đúng có tồn tại trong các lựa chọn không
        if (question.correctAnswer.length === 0) {
          errors[index] = `Vui lòng chọn ít nhất một đáp án đúng cho câu hỏi ${
            question.equestion === EQuestion.SINGLE_CHOICE ? 'một lựa chọn' : 'nhiều lựa chọn'
          }`;
          isValid = false;
          return;
        }

        // Đối với trắc nghiệm, đáp án đúng là index của lựa chọn
        const selectedIndices = question.correctAnswer.map(answer => parseInt(answer));
        const invalidIndices = selectedIndices.filter(index => 
          isNaN(index) || index < 0 || index >= question.options.length || !question.options[index].trim()
        );
        
        if (invalidIndices.length > 0) {
          errors[index] = "Đáp án đúng không hợp lệ";
          isValid = false;
          return;
        }
      }
    });

    setQuestionErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!quizInfo.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài kiểm tra');
      return;
    }
    
    if (questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }
    
    // Validate all questions before submitting
    if (!validateQuestions()) {
      toast.error('Vui lòng kiểm tra lại thông tin các câu hỏi');
      return;
    }
    
    // Show loading
    setIsSaving(true);
    
    try {
      // Create request body
      const requestBody = {
        title: quizInfo.title,
        description: quizInfo.description || 'null',
        timeLimit: quizInfo.timeLimit,
        passingScore: quizInfo.passingScore,
        order: quizInfo.order,
        status: quizInfo.status,
        // equiz: quizInfo.equiz,
        questions: questions.map(q => {
          // Chuẩn bị câu hỏi dựa trên loại
          const formattedQuestion: {
            question: string;
            material: string | null;
            eQuestion?: EQuestion;
            options: string[];
            correctAnswer: string[];
          } = {
            question: q.question,
            material: q.material || null,
            options: [],
            correctAnswer: []
          };

          // Add equestion field only when needed
          if (q.equestion) {
            formattedQuestion.eQuestion = q.equestion;
          }

          if (q.equestion === EQuestion.SHORT_ANSWER) {
            // Đối với câu trả lời ngắn, giữ nguyên correctAnswer là mảng các câu trả lời được chấp nhận
            formattedQuestion.correctAnswer = q.correctAnswer.filter(answer => answer.trim());
            // Không cần options cho câu trả lời ngắn
            formattedQuestion.options = [];
          } else {
            // Đối với câu hỏi trắc nghiệm, chỉ giữ lại options có nội dung
            formattedQuestion.options = q.options.filter(option => option.trim());
            
            // Đối với câu hỏi trắc nghiệm, lưu giá trị đáp án thay vì index
            if (q.equestion === EQuestion.SINGLE_CHOICE || q.equestion === EQuestion.MULTIPLE_CHOICE) {
              // Lấy các đáp án dựa trên các index đã chọn
              formattedQuestion.correctAnswer = q.correctAnswer
                .map(answerIndex => {
                  const index = parseInt(answerIndex);
                  return isNaN(index) ? answerIndex : q.options[index];
                })
                .filter(answer => answer && answer.trim());
            }
          }

          return formattedQuestion;
        })
      };
      
      console.log("Sending quiz data:", requestBody);

      // Gửi yêu cầu tạo bài kiểm tra trực tiếp qua API
      const response = await fetch(`${API_BASE_URL}/course/create-quiz?courseId=${courseId}&type=QUIZ_FORM_FULL`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Không thể tạo bài kiểm tra");
      }

      const data = await response.json();
      console.log("Quiz created successfully:", data);

      setSuccess(true);
      toast.success("Bài kiểm tra đã được tạo thành công!");
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}`);
      }, 2000);
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Không thể tạo bài kiểm tra. Vui lòng thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for PDF material upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước tệp PDF quá lớn. Tối đa 10MB');
      return;
    }
    
    // Check file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast.error('Chỉ chấp nhận tệp PDF');
      return;
    }
    
    setUploadingPdf(true);
    
    try {
      // Use the PDF upload API
      const formData = new FormData();
      formData.append('files', file);
      
      console.log('Uploading PDF...');
      
      const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải lên tệp PDF');
      }
      
      // API returns URL directly as text
      const pdfUrl = await response.text();
      console.log('PDF URL:', pdfUrl);
      const urlArray = JSON.parse(pdfUrl);
      const url = urlArray[0];
      setQuizInfo({
        ...quizInfo,
        material: url
      });
      
      toast.success('Tải lên tệp PDF thành công');
      
      // Reset file input
      if (pdfFileInputRef.current) {
        pdfFileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading PDF:', err);
      toast.error('Không thể tải lên tệp PDF. Vui lòng thử lại sau.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Remove PDF material
  const removePdf = () => {
    setQuizInfo({
      ...quizInfo,
      material: null
    });
    toast.success('Đã xóa tệp PDF');
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <span className="ml-3 text-gray-700">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || "Không tìm thấy thông tin khóa học"}</p>
            </div>
          </div>
        </div>
        <Link
          href={`/admin/couserscontrol`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/admin/couserscontrol/${courseId}`}
          className="text-gray-500 hover:text-gray-700 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Thêm bài kiểm tra mới</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Khóa học</div>
          <div className="text-lg font-medium">{course.title}</div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Bài kiểm tra đã được tạo thành công! Đang chuyển hướng...</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề bài kiểm tra <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={quizInfo.title}
                onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={quizInfo.description}
                onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đạt (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="passingScore"
                  name="passingScore"
                  value={quizInfo.passingScore}
                  onChange={(e) => setQuizInfo({ ...quizInfo, passingScore: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian làm bài (phút)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={quizInfo.timeLimit}
                  onChange={(e) => setQuizInfo({ ...quizInfo, timeLimit: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự <span className="text-indigo-600">(Tự động)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={quizInfo.order}
                    onChange={(e) => setQuizInfo({ ...quizInfo, order: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    <div>Thông tin hiện tại của khóa học:</div>
                    <div>- Thứ tự cao nhất của bài học: {orderInfo.maxLessonOrder || 'Chưa có'}</div>
                    <div>- Thứ tự cao nhất của bài kiểm tra: {orderInfo.maxQuizOrder || 'Chưa có'}</div>
                    <div>- Thứ tự cao nhất trong khóa học: {orderInfo.maxOrder || 'Chưa có'}</div>
                    <div className="text-indigo-600 font-medium">→ Tự động đặt thứ tự tiếp theo: {orderInfo.nextOrder}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="equiz" className="block text-sm font-medium text-gray-700 mb-1">
                  Loại bài kiểm tra
                </label>
                <select
                  id="equiz"
                  name="equiz"
                  value={quizInfo.equiz}
                  onChange={(e) => setQuizInfo({ ...quizInfo, equiz: e.target.value as QuizType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={QuizType.QUIZ_FORM_FULL}>Bài kiểm tra đầy đủ</option>
                  <option value={QuizType.QUIZ_FILL}>Phiếu trả lời</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {quizInfo.equiz === QuizType.QUIZ_FORM_FULL 
                    ? "Hiển thị đầy đủ nội dung câu hỏi và các phương án trả lời." 
                    : "Hiển thị đề bài dưới dạng tài liệu PDF và phiếu trắc nghiệm để điền đáp án."}
                </p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                  <span className="ml-1 text-gray-400 font-normal">(Ảnh hưởng đến khả năng truy cập của học viên)</span>
                </label>
                <select
                  value={quizInfo.status}
                  onChange={(e) => setQuizInfo({ ...quizInfo, status: e.target.value as QuizStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={QuizStatus.INACTIVE}>Không kích hoạt</option>
                  <option value={QuizStatus.ACTIVE}>Kích hoạt</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                Tài liệu bài kiểm tra (PDF)
                {quizInfo.equiz === QuizType.QUIZ_FILL && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {quizInfo.material ? (
                <div className="mt-2 relative border border-gray-300 rounded-md p-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-red-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.819 14.427c.064.267.077.679-.021.948-.128.351-.381.528-.754.528h-.637v-2.12h.496c.474 0 .803.173.916.644zm3.091-8.65c2.047-.479 4.805.279 6.09 1.179-1.494-1.997-5.23-5.708-7.432-6.882 1.157 1.168 1.563 4.235 1.342 5.703zm-7.457 7.955h-.546v.943h.546c.235 0 .467-.027.576-.227.067-.123.067-.366 0-.489-.121-.218-.326-.227-.576-.227zm13.547-2.732v13h-20v-24h8.409c4.858 0 3.334 8 3.334 8 3.011-.745 8.257-.42 8.257 3zm-12.108 2.761c-.16-.484-.606-.761-1.224-.761h-1.668v3.686h.907v-1.277h.761c.619 0 1.064-.277 1.224-.763.094-.292.094-.597 0-.885zm3.407-.303c-.297-.299-.711-.458-1.199-.458h-1.599v3.686h1.599c.537 0 .961-.181 1.262-.535.554-.659.586-2.035-.063-2.693zm3.701-.458h-2.628v3.686h.907v-1.472h1.49v-.732h-1.49v-.698h1.721v-.784z" />
                    </svg>
                    <div>
                      <a href={quizInfo.material} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Xem tài liệu PDF
                      </a>
                      <p className="text-sm text-gray-500">Đã tải lên thành công</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePdf}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="pdfMaterial"
                    ref={pdfFileInputRef}
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handlePdfUpload}
                  />
                  <label
                    htmlFor="pdfMaterial"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    {uploadingPdf ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" />
                        Đang tải lên...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.819 14.427c.064.267.077.679-.021.948-.128.351-.381.528-.754.528h-.637v-2.12h.496c.474 0 .803.173.916.644zm3.091-8.65c2.047-.479 4.805.279 6.09 1.179-1.494-1.997-5.23-5.708-7.432-6.882 1.157 1.168 1.563 4.235 1.342 5.703zm-7.457 7.955h-.546v.943h.546c.235 0 .467-.027.576-.227.067-.123.067-.366 0-.489-.121-.218-.326-.227-.576-.227zm13.547-2.732v13h-20v-24h8.409c4.858 0 3.334 8 3.334 8 3.011-.745 8.257-.42 8.257 3zm-12.108 2.761c-.16-.484-.606-.761-1.224-.761h-1.668v3.686h.907v-1.277h.761c.619 0 1.064-.277 1.224-.763.094-.292.094-.597 0-.885zm3.407-.303c-.297-.299-.711-.458-1.199-.458h-1.599v3.686h1.599c.537 0 .961-.181 1.262-.535.554-.659.586-2.035-.063-2.693zm3.701-.458h-2.628v3.686h.907v-1.472h1.49v-.732h-1.49v-.698h1.721v-.784z" />
                        </svg>
                        Tải lên PDF
                      </span>
                    )}
                  </label>
                  <p className="ml-2 text-xs text-gray-500">PDF tối đa 10MB</p>
                </div>
              )}
              {quizInfo.equiz === QuizType.QUIZ_FILL && !quizInfo.material && (
                <p className="text-xs text-red-500 mt-1">
                  Bài kiểm tra dạng phiếu trả lời cần có tài liệu PDF kèm theo
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Câu hỏi</h3>
              <div className="flex">
                <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {questions.length} câu hỏi
                </div>
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Thêm câu hỏi cho bài kiểm tra. Bạn có thể tạo câu hỏi nhiều lựa chọn, câu hỏi một lựa chọn, hoặc câu hỏi trả lời ngắn.
              Với câu hỏi trắc nghiệm (một hoặc nhiều lựa chọn), bạn chỉ cần tạo ít nhất 1 lựa chọn và có thể thêm nhiều lựa chọn tùy ý.
              Với câu hỏi trả lời ngắn, bạn có thể thêm nhiều đáp án đúng được chấp nhận.
            </div>
          </div>

          <div className="space-y-8 mt-6">
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Câu hỏi {index + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800 flex items-center text-sm"
                    >
                      <MinusCircle className="w-4 h-4 mr-1" />
                      Xóa câu hỏi
                    </button>
                  )}
                </div>

                {questionErrors[index] && (
                  <div className="bg-red-50 text-red-700 p-2 mb-3 rounded text-sm">
                    {questionErrors[index]}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="mb-4">
                    <label
                      htmlFor={`question-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nội dung câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id={`question-${index}`}
                      placeholder="Nhập nội dung câu hỏi"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={2}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại câu hỏi
                    </label>
                    <select
                      value={question.equestion}
                      onChange={(e) => handleQuestionChange(index, 'equestion', e.target.value as EQuestion)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={EQuestion.SINGLE_CHOICE}>Chọn một đáp án</option>
                      <option value={EQuestion.MULTIPLE_CHOICE}>Chọn nhiều đáp án</option>
                      <option value={EQuestion.SHORT_ANSWER}>Câu trả lời ngắn</option>
                    </select>
                  </div>

                  {/* Hiển thị tùy chọn dựa trên loại câu hỏi */}
                  {question.equestion !== EQuestion.SHORT_ANSWER && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Các lựa chọn
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center mb-2">
                          <input
                            type={question.equestion === EQuestion.SINGLE_CHOICE ? "radio" : "checkbox"}
                            id={`question-${index}-option-${optionIndex}`}
                            name={`question-${index}-correct`}
                            value={optionIndex.toString()}
                            checked={question.correctAnswer.includes(optionIndex.toString())}
                            onChange={(e) => {
                              // Xử lý chọn đáp án đúng
                              if (question.equestion === EQuestion.SINGLE_CHOICE) {
                                // Chỉ cho phép chọn một đáp án với SINGLE_CHOICE
                                handleQuestionChange(index, 'correctAnswer', [e.target.value]);
                              } else {
                                // Cho phép chọn nhiều đáp án với MULTIPLE_CHOICE
                                const newCorrectAnswers = [...question.correctAnswer];
                                if (e.target.checked) {
                                  // Thêm vào danh sách đáp án đúng nếu được chọn
                                  if (!newCorrectAnswers.includes(e.target.value)) {
                                    newCorrectAnswers.push(e.target.value);
                                  }
                                } else {
                                  // Loại bỏ khỏi danh sách đáp án đúng nếu bỏ chọn
                                  const idx = newCorrectAnswers.indexOf(e.target.value);
                                  if (idx !== -1) {
                                    newCorrectAnswers.splice(idx, 1);
                                  }
                                }
                                handleQuestionChange(index, 'correctAnswer', newCorrectAnswers);
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <input
                            type="text"
                            placeholder={`Lựa chọn ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex] = e.target.value;
                              handleQuestionChange(index, 'options', newOptions);
                            }}
                            className="ml-2 flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {question.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                // Chỉ cho phép xóa khi còn nhiều hơn 1 lựa chọn
                                const newOptions = [...question.options];
                                newOptions.splice(optionIndex, 1);
                                
                                // Cập nhật correctAnswer
                                let newCorrectAnswers = [...question.correctAnswer];
                                
                                // Loại bỏ optionIndex khỏi correctAnswer
                                newCorrectAnswers = newCorrectAnswers
                                  .filter(a => parseInt(a) !== optionIndex)
                                  .map(a => {
                                    const aIndex = parseInt(a);
                                    // Giảm index cho các đáp án có index lớn hơn index bị xóa
                                    if (aIndex > optionIndex) {
                                      return (aIndex - 1).toString();
                                    }
                                    return a;
                                  });
                                
                                handleQuestionChange(index, 'options', newOptions);
                                handleQuestionChange(index, 'correctAnswer', newCorrectAnswers);
                              }}
                              className="ml-2 text-red-500 hover:text-red-700"
                              title="Xóa lựa chọn này"
                            >
                              <MinusCircle className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {question.options.length < 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = [...question.options, ''];
                            handleQuestionChange(index, 'options', newOptions);
                          }}
                          className="mt-2 inline-flex items-center text-sm text-indigo-600"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" /> Thêm lựa chọn
                        </button>
                      )}
                    </div>
                  )}
                  
                  {question.equestion === EQuestion.SHORT_ANSWER && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đáp án đúng (nhập 1 đáp án duy nhất)
                      </label>
                      <textarea
                        placeholder="Nhập câu trả lời đúng"
                        value={question.correctAnswer[0] || ''}
                        onChange={(e) => {
                          const answer = e.target.value.trim();
                          handleQuestionChange(index, 'correctAnswer', answer ? [answer] : []);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows={2}
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label
                      htmlFor={`material-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Hình ảnh cho câu hỏi (tùy chọn)
                    </label>
                    
                    {question.material ? (
                      <div className="mt-2 relative">
                        <img 
                          src={question.material} 
                          alt={`Hình ảnh câu hỏi ${index + 1}`} 
                          className="max-h-48 max-w-full rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          id={`material-${index}`}
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => e.target.files && e.target.files[0] && handleImageUpload(index, e.target.files[0])}
                          ref={index === 0 ? fileInputRef : undefined}
                        />
                        <label
                          htmlFor={`material-${index}`}
                          className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                          {uploadingImage[index] ? (
                            <span className="flex items-center">
                              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" />
                              Đang tải lên...
                            </span>
                          ) : (
                            <span>Tải lên hình ảnh</span>
                          )}
                        </label>
                        <p className="ml-2 text-xs text-gray-500">PNG, JPG, GIF, WEBP lên đến 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center text-indigo-600 hover:text-indigo-800 px-4 py-2 border border-dashed border-gray-300 rounded-md bg-white"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Thêm câu hỏi
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href={`/admin/couserscontrol/${courseId}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu bài kiểm tra
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 