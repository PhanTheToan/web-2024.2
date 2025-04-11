"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, AlertCircle, CheckCircle, Loader2, 
  Plus, Trash, Save, Edit, Image, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Course } from '@/app/types';

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
  createdAt?: Date;
}

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Quiz information state
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    timeLimit: 30, // in minutes
    passingScore: 70, // percentage
    order: 1,
  });

  // Questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    material: null
  });

  // Track if we're editing an existing question
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
      
      // Fetch course data
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

      const quizData = await quizResponse.json() as Quiz;
      console.log("Quiz data:", quizData);
      
      // Set quiz info with optional fields that might not be in the type
      setQuizInfo({
        title: quizData.title || '',
        description: quizData.description || '',
        timeLimit: quizData.timeLimit || 30,
        passingScore: quizData.passingScore || 70,
        order: quizData.order || 1,
      });
      
      // Set questions
      if (Array.isArray(quizData.questions)) {
        setQuestions(quizData.questions.map((q: QuizQuestion) => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          material: q.material || null
        })));
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for quiz info changes
  const handleQuizInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuizInfo({
      ...quizInfo,
      [name]: name === 'passingScore' || name === 'timeLimit' 
        ? parseInt(value) || 0 
        : value,
    });
  };

  // Handler for current question changes
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentQuestion({
      ...currentQuestion,
      [name]: value,
    });
  };

  // Handler for option changes
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  // Handler for correct answer selection
  const handleCorrectAnswerChange = (option: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswer: option,
    });
  };

  // Handler for image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tệp quá lớn. Tối đa 5MB');
      return;
    }
    
    // Check file type (image only)
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận tệp hình ảnh');
      return;
    }
    
    setUploadingImage(true);
    
    try {
      // Use the image upload API from screenshot
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Uploading image...');
      
      const response = await fetch(`${API_BASE_URL}/upload/image/r2`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải lên hình ảnh');
      }
      
      // API returns URL directly as text
      const imageUrl = await response.text();
      console.log('Image URL:', imageUrl);
      
      setCurrentQuestion({
        ...currentQuestion,
        material: imageUrl
      });
      
      toast.success('Tải lên hình ảnh thành công');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Không thể tải lên hình ảnh. Vui lòng thử lại sau.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Remove image from current question
  const removeImage = () => {
    setCurrentQuestion({
      ...currentQuestion,
      material: null
    });
    toast.success('Đã xóa hình ảnh');
  };

  // Load a question for editing
  const editQuestion = (index: number) => {
    const questionToEdit = questions[index];
    
    // Make sure we have 4 options, filling empty ones as needed
    const options = [...questionToEdit.options];
    while (options.length < 4) {
      options.push('');
    }
    
    setCurrentQuestion({
      question: questionToEdit.question,
      options: options,
      correctAnswer: questionToEdit.correctAnswer,
    });
    
    setEditingQuestionIndex(index);
    setIsEditMode(true);
    
    // Scroll to the question form
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Cancel editing and reset form
  const cancelEditing = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
    
    setEditingQuestionIndex(null);
    setIsEditMode(false);
  };

  // Add a new question or update existing one
  const addOrUpdateQuestion = () => {
    // Validate the question
    if (!currentQuestion.question.trim()) {
      toast.error('Vui lòng nhập câu hỏi');
      return;
    }

    // Ensure we have at least 2 valid options
    const validOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Vui lòng nhập ít nhất 2 phương án trả lời');
      return;
    }

    // Ensure a correct answer is selected
    if (!currentQuestion.correctAnswer) {
      toast.error('Vui lòng chọn đáp án đúng');
      return;
    }

    const updatedQuestion = {
      ...currentQuestion,
      options: validOptions,
    };
    
    if (isEditMode && editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = updatedQuestion;
      setQuestions(updatedQuestions);
      toast.success('Cập nhật câu hỏi thành công');
      
      // Reset form
      cancelEditing();
    } else {
      // Add new question
      setQuestions([...questions, updatedQuestion]);
      
      // Reset form after adding
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      });
    }
  };

  // Remove a question from the list
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    
    // If we're editing this question, reset the form
    if (editingQuestionIndex === index) {
      cancelEditing();
    } else if (editingQuestionIndex !== null && editingQuestionIndex > index) {
      // Adjust the index if we're editing a question after the removed one
      setEditingQuestionIndex(editingQuestionIndex - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (!quizInfo.title.trim()) {
        throw new Error('Vui lòng nhập tiêu đề bài kiểm tra');
      }

      if (questions.length === 0) {
        throw new Error('Vui lòng thêm ít nhất một câu hỏi');
      }

      // Prepare request data for API
      const requestData = {
        title: quizInfo.title,
        description: quizInfo.description,
        order: quizInfo.order,
        passingScore: quizInfo.passingScore,
        timeLimit: quizInfo.timeLimit,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          material: q.material || null
        }))
      };

      console.log("Updating quiz with data:", requestData);
      
      // Use the update-quiz API from screenshot
      const response = await fetch(`${API_BASE_URL}/course/update-quiz/${quizId}?courseId=${courseId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Không thể cập nhật bài kiểm tra");
      }
      
      const data = await response.json();
      console.log("Quiz updated successfully:", data);

      // Show success message and redirect
      setSuccess('Cập nhật bài kiểm tra thành công!');
      toast.success('Cập nhật bài kiểm tra thành công!');
      
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}/quizzes/${quizId}`);
      }, 1500);

    } catch (err) {
      console.error('Failed to update quiz:', err);
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Không thể cập nhật bài kiểm tra. Vui lòng thử lại sau.');
        toast.error('Không thể cập nhật bài kiểm tra. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Đang tải thông tin bài kiểm tra...</span>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Không tìm thấy khóa học.</span>
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header with breadcrumbs */}
      <div className="flex flex-wrap items-center gap-y-2 mb-6">
        <Link href="/admin/couserscontrol" className="text-gray-500 hover:text-gray-700 mr-2">
          Quản lý khóa học
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href={`/admin/couserscontrol/${courseId}`} className="text-gray-500 hover:text-gray-700 mr-2">
          {course?.title || 'Khóa học'}
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href={`/admin/couserscontrol/${courseId}/quizzes/${quizId}`} className="text-gray-500 hover:text-gray-700 mr-2">
          {quizInfo.title}
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-900 font-medium">Chỉnh sửa</span>
      </div>
      
      {/* Back button */}
      <Link
        href={`/admin/couserscontrol/${courseId}/quizzes/${quizId}`}
        className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại chi tiết bài kiểm tra
      </Link>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <div className="flex">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
          <div className="flex">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}
      
      {/* Quiz Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-6">Chỉnh sửa bài kiểm tra</h2>
          
          {/* Basic Quiz Info */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={quizInfo.title}
                onChange={handleQuizInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập tiêu đề bài kiểm tra"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={quizInfo.description}
                onChange={handleQuizInfoChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập mô tả bài kiểm tra"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đạt (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="passingScore"
                  name="passingScore"
                  value={quizInfo.passingScore}
                  onChange={handleQuizInfoChange}
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
                  onChange={handleQuizInfoChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Questions Section */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Câu hỏi ({questions.length})</h3>
          
          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-6 mb-8">
              {questions.map((question, index) => (
                <div key={index} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="font-medium mb-2">
                        Câu {index + 1}: {question.question}
                      </div>
                      
                      <div className="space-y-1 pl-4">
                        {question.options.map((option, optIdx) => (
                          option && (
                            <div key={optIdx} className={`text-sm ${option === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                              {option === question.correctAnswer && (
                                <CheckCircle className="w-4 h-4 inline-block mr-1 text-green-600" />
                              )}
                              {option}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        type="button"
                        onClick={() => editQuestion(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md mb-6">
              <p className="text-gray-500">Chưa có câu hỏi nào. Thêm câu hỏi bên dưới.</p>
            </div>
          )}
          
          {/* Add/Edit New Question */}
          <div id="question-form" className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-md font-medium mb-4">
              {isEditMode ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                  Câu hỏi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="question"
                  name="question"
                  value={currentQuestion.question}
                  onChange={handleQuestionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nhập nội dung câu hỏi"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh cho câu hỏi (tùy chọn)
                </label>
                
                {currentQuestion.material ? (
                  <div className="mt-2 relative">
                    <img 
                      src={currentQuestion.material} 
                      alt="Hình ảnh câu hỏi" 
                      className="max-h-48 max-w-full rounded border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      id="material"
                      ref={fileInputRef}
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="material"
                      className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      {uploadingImage ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" />
                          Đang tải lên...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Image className="h-4 w-4 mr-2" />
                          Tải lên hình ảnh
                        </span>
                      )}
                    </label>
                    <p className="ml-2 text-xs text-gray-500">PNG, JPG, GIF, WEBP lên đến 5MB</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương án trả lời <span className="text-red-500">*</span>
                </label>
                
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <span className="w-6 text-sm text-gray-500">{idx + 1}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Phương án ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                  Đáp án đúng <span className="text-red-500">*</span>
                </label>
                <select
                  id="correctAnswer"
                  name="correctAnswer"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Chọn đáp án đúng</option>
                  {currentQuestion.options.map((option, idx) => (
                    option.trim() ? (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ) : null
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={addOrUpdateQuestion}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Controls */}
        <div className="p-6 flex justify-end">
          <Link
            href={`/admin/couserscontrol/${courseId}/quizzes/${quizId}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-200 font-medium shadow-sm hover:shadow transition"
          >
            Hủy
          </Link>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center font-medium shadow-md hover:shadow-lg transition"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 