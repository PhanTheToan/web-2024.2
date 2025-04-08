"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { quizService } from '@/services/quizService';
import { 
  ArrowLeft, AlertCircle, CheckCircle, Loader2, 
  Plus, Trash, Save, Edit
} from 'lucide-react';
import { Course } from '@/app/types';
import { toast } from 'react-hot-toast';

// Define Quiz-related types based on quizService.ts
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
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
  
  // Track if we're editing an existing question
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch course data
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData as Course);
        
        // Fetch quiz data
        const quizData = await quizService.getQuizById(quizId) as Quiz;
        
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

  // Handler for options changes
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  // Handler for correct answer selection
  const handleCorrectAnswerChange = (option: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswer: option,
    });
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

    // Filter out empty options
    const validOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Vui lòng nhập ít nhất 2 phương án trả lời');
      return;
    }

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

      // Prepare data for API
      const quizData = {
        ...quizInfo,
        questions: questions,
      };

      // Call API to update quiz
      await quizService.updateQuiz(quizId, quizData);

      // Show success message and redirect
      setSuccess('Cập nhật bài kiểm tra thành công!');
      toast.success('Cập nhật bài kiểm tra thành công!');
      
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}/quizzes/${quizId}`);
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Không tìm thấy khóa học.</span>
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
      {/* Header */}
      <div className="flex items-center mb-2">
        <Link 
          href={`/teacher/courses/${courseId}/quizzes/${quizId}`}
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa bài kiểm tra</h1>
      </div>
      
      <p className="text-gray-500 mb-6">Khóa học: <span className="font-medium">{course.title}</span></p>

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
          <h2 className="text-xl font-bold mb-6">Thông tin bài kiểm tra</h2>
          
          {/* Basic Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="p-6">
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
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 mb-6">
              <p>Chưa có câu hỏi nào. Vui lòng thêm ít nhất một câu hỏi.</p>
            </div>
          )}
          
          {/* Add/Edit Question Form */}
          <div id="question-form" className="border rounded-md p-6 bg-white">
            <h4 className="font-medium mb-4 text-lg">
              {isEditMode ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Câu hỏi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="question"
                value={currentQuestion.question}
                onChange={handleQuestionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nhập câu hỏi"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Các phương án trả lời <span className="text-red-500">*</span>
              </label>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      checked={option === currentQuestion.correctAnswer && option !== ''}
                      onChange={() => option && handleCorrectAnswerChange(option)}
                      className="mr-2"
                      disabled={!option}
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`Phương án ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-2">Chọn phương án đúng bằng cách nhấp vào nút tròn bên trái.</p>
            </div>
            
            <div className="flex space-x-3">
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isEditMode ? 'Cập nhật' : 'Thêm câu hỏi'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <Link
            href={`/teacher/courses/${courseId}/quizzes/${quizId}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </Link>
          
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
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