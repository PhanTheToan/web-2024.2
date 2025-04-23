"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, MinusCircle, Save, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Course, EQuestion, QuizStatus } from "@/app/types";
import { toast } from "react-hot-toast";
import dotenv from 'dotenv';
dotenv.config();
// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

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

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [status, setStatus] = useState<QuizStatus>(QuizStatus.INACTIVE);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: ["0"], material: null, equestion: EQuestion.SINGLE_CHOICE }
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [questionErrors, setQuestionErrors] = useState<Record<number, string>>({});
  const [order, setOrder] = useState<number>(1);
  const [orderInfo, setOrderInfo] = useState<{
    maxOrder: number;
    maxLessonOrder: number;
    maxQuizOrder: number;
    nextOrder: number;
  }>({ maxOrder: 0, maxLessonOrder: 0, maxQuizOrder: 0, nextOrder: 1 });
  const [uploadingImage, setUploadingImage] = useState<Record<number, boolean>>({});

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
      setLoading(true);
      console.log("Fetching course:", courseId);
      const response = await fetch(`${API_BASE_URL}/course/info/${courseId}`, {
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
      setLoading(false);
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
            maxOrder = Math.max(maxOrder, quiz.orderQuiz);
          }
        });
      }
      
      // Đặt order quiz mới là maxOrder + 1
      const nextOrder = maxOrder + 1;
      setOrder(nextOrder);
      console.log("Max order values:", { maxOrder, maxLessonOrder, maxQuizOrder, nextOrder });
      
      // Lưu thông tin để hiển thị UI
      setOrderInfo({
        maxOrder,
        maxLessonOrder,
        maxQuizOrder,
        nextOrder
      });
    } catch (err) {
      console.error("Error fetching lessons and quizzes:", err);
      // Không cần thiết lập lỗi, giữ giá trị mặc định là 1
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
      newQuestions[index].equestion = value as EQuestion;
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
      options: ["", "", "", ""], 
      correctAnswer: ["0"], 
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
      if (question.correctAnswer.length === 0) {
        errors[index] = "Phải có ít nhất một đáp án đúng";
        isValid = false;
        return;
      }

      // Nếu là câu hỏi trắc nghiệm (không phải SHORT_ANSWER), kiểm tra lựa chọn
      if (question.equestion !== EQuestion.SHORT_ANSWER) {
        // Đếm số lựa chọn có nội dung
        const validOptions = question.options.filter(option => option.trim());
        
        if (validOptions.length < 2) {
          errors[index] = "Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn";
          isValid = false;
          return;
        }

        // Kiểm tra xem đáp án đúng có tồn tại trong các lựa chọn không
        if (question.equestion === EQuestion.SINGLE_CHOICE || 
            question.equestion === EQuestion.MULTIPLE_CHOICE) {
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
      }
    });

    setQuestionErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      setError("Vui lòng điền tiêu đề bài kiểm tra");
      return;
    }

    if (!validateQuestions()) {
      setError("Vui lòng kiểm tra lại thông tin các câu hỏi");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      // Chuẩn bị dữ liệu gửi đi theo cấu trúc trong hình
      const requestData = {
        title: title,
        description: description,
        order: order,
        passingScore: passingScore,
        timeLimit: timeLimit,
        status: status,
        questions: questions.map(q => {
          // Chuẩn bị câu hỏi dựa trên loại
          const formattedQuestion: {
            question: string;
            material: string | null;
            equestion: EQuestion;
            options: string[];
            correctAnswer: string[];
          } = {
            question: q.question,
            material: q.material || null,
            equestion: q.equestion,
            options: [],
            correctAnswer: []
          };

          if (q.equestion === EQuestion.SHORT_ANSWER) {
            // Đối với câu trả lời ngắn, giữ nguyên correctAnswer là mảng các câu trả lời được chấp nhận
            formattedQuestion.correctAnswer = q.correctAnswer;
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
      
      console.log("Sending quiz data:", requestData);

      // Gửi yêu cầu tạo bài kiểm tra trực tiếp qua API
      const response = await fetch(`${API_BASE_URL}/course/create-quiz?courseId=${courseId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
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
      setSubmitting(false);
    }
  };

  if (loading) {
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự bài kiểm tra <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="order"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={order}
                  onChange={(e) => setOrder(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  required
                />
                <div className="ml-3 text-sm text-gray-500">
                  (Tự động đặt là phần cuối khóa học)
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div>Thông tin hiện tại của khóa học:</div>
                <div>- Thứ tự cao nhất của bài học: {orderInfo.maxLessonOrder || 'Chưa có'}</div>
                <div>- Thứ tự cao nhất của bài kiểm tra: {orderInfo.maxQuizOrder || 'Chưa có'}</div>
                <div>- Thứ tự cao nhất trong khóa học: {orderInfo.maxOrder || 'Chưa có'}</div>
                <div className="text-indigo-600 font-medium">→ Thứ tự tiếp theo: {orderInfo.nextOrder}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian làm bài (phút)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đạt yêu cầu (%)
                </label>
                <input
                  type="number"
                  id="passingScore"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái bài kiểm tra
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuizStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={QuizStatus.INACTIVE}>Không kích hoạt</option>
                <option value={QuizStatus.ACTIVE}>Kích hoạt</option>
              </select>
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
              Thêm câu hỏi cho bài kiểm tra. Mỗi câu hỏi có 4 lựa chọn và 1 đáp án đúng.
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
                            className="ml-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
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
                        Đáp án đúng (nhập các đáp án có thể chấp nhận, mỗi đáp án trên một dòng)
                      </label>
                      <textarea
                        placeholder="Nhập câu trả lời đúng"
                        value={question.correctAnswer.join('\n')}
                        onChange={(e) => {
                          const answers = e.target.value.split('\n').filter(answer => answer.trim() !== '');
                          handleQuestionChange(index, 'correctAnswer', answers);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
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
              disabled={submitting}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
            >
              {submitting ? (
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