"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { quizService } from '@/services/quizService';
import { 
  ArrowLeft, AlertCircle, CheckCircle, Loader2, 
  Plus, Trash, Save
} from 'lucide-react';
import { Course } from '@/app/types';
import { toast } from 'react-hot-toast';

// Define Quiz-related types based on quizService.ts
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  createdAt: Date;
}

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Basic quiz information
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    timeLimit: 30, // in minutes
    passingScore: 70, // percentage
  });

  // Questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course data
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData as Course);
        
        // Fetch quiz data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quizData = await quizService.getQuizById(quizId) as any;
        
        // Set quiz info with optional fields that might not be in the type
        setQuizInfo({
          title: quizData.title,
          description: quizData.description || '',
          timeLimit: quizData.timeLimit || 30,
          passingScore: quizData.passingScore,
        });
        
        // Set questions
        setQuestions(quizData.questions.map((q: QuizQuestion) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        })));
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId && quizId) {
      fetchData();
    }
  }, [courseId, quizId]);

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
  const handleCorrectAnswerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswer: e.target.value,
    });
  };

  // Add question to quiz
  const addQuestion = () => {
    // Validate question
    if (!currentQuestion.question.trim()) {
      setError('Vui lòng nhập câu hỏi');
      return;
    }

    // Validate options (at least 2 non-empty options)
    const nonEmptyOptions = currentQuestion.options.filter(option => option.trim() !== '');
    if (nonEmptyOptions.length < 2) {
      setError('Vui lòng nhập ít nhất 2 phương án trả lời');
      return;
    }

    // Validate correct answer
    if (!currentQuestion.correctAnswer) {
      setError('Vui lòng chọn đáp án đúng');
      return;
    }

    // Add question to list
    setQuestions([...questions, { ...currentQuestion }]);
    
    // Reset current question
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
    
    setError(null);
  };

  // Remove question from quiz
  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!quizInfo.title.trim()) {
        throw new Error('Vui lòng nhập tiêu đề bài kiểm tra');
      }
      
      if (questions.length === 0) {
        throw new Error('Vui lòng thêm ít nhất một câu hỏi');
      }
      
      // Prepare quiz data
      const quizData = {
        _id: quizId,
        courseId,
        title: quizInfo.title,
        description: quizInfo.description,
        questions,
        passingScore: quizInfo.passingScore,
        timeLimit: quizInfo.timeLimit,
      };
      
      // Update quiz
      await quizService.updateQuiz(quizId, quizData);
      
      setSuccess('Cập nhật bài kiểm tra thành công!');
      toast.success('Cập nhật bài kiểm tra thành công!');
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}/quizzes/${quizId}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to update quiz:', err);
      setError((err as Error).message || 'Không thể cập nhật bài kiểm tra. Vui lòng thử lại sau.');
      toast.error((err as Error).message || 'Không thể cập nhật bài kiểm tra');
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
                    
                    <button 
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md mb-6">
              <p className="text-gray-500">Chưa có câu hỏi nào. Thêm câu hỏi bên dưới.</p>
            </div>
          )}
          
          {/* Add New Question */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-md font-medium mb-4">Thêm câu hỏi mới</h4>
            
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
                  placeholder="Nhập câu hỏi"
                />
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
                  onChange={handleCorrectAnswerChange}
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
              
              <div className="text-right">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center ml-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi
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