"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { quizService } from "@/services/quizService";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { Clock, AlertTriangle, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";

// Types for quiz data
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  createdAt: Date;
}

interface Course {
  _id: string;
  title: string;
  description: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  feedback: {
    questionIndex: number;
    isCorrect: boolean;
    correctAnswer?: string;
  }[];
}

// Quiz question component
interface QuizQuestionProps {
  question: string;
  options: string[];
  questionIndex: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  isSubmitted: boolean;
  correctAnswer?: string;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  questionIndex,
  selectedAnswer,
  onSelectAnswer,
  isSubmitted,
  correctAnswer
}) => {
  return (
    <div id={`question-${questionIndex}`} className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-bold mb-4">
        Câu hỏi {questionIndex + 1}: {question}
      </h3>
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = option === selectedAnswer;
          let optionClassName = "p-4 border rounded-lg flex items-center";
          
          if (isSubmitted) {
            if (option === correctAnswer) {
              optionClassName += " bg-green-50 border-green-300";
            } else if (isSelected && option !== correctAnswer) {
              optionClassName += " bg-red-50 border-red-300";
            }
          } else if (isSelected) {
            optionClassName += " bg-blue-50 border-blue-300";
          } else {
            optionClassName += " hover:bg-gray-50";
          }
          
          return (
            <div 
              key={index} 
              className={optionClassName}
              onClick={() => !isSubmitted && onSelectAnswer(option)}
            >
              <div className={`w-5 h-5 flex-shrink-0 rounded-full border mr-3 ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {isSelected && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <span>{option}</span>
              
              {isSubmitted && (
                <div className="ml-auto">
                  {option === correctAnswer ? (
                    <CheckCircle className="text-green-500 w-5 h-5" />
                  ) : (isSelected && option !== correctAnswer) ? (
                    <AlertCircle className="text-red-500 w-5 h-5" />
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Question navigation item
interface QuestionNavItemProps {
  index: number;
  isAnswered: boolean;
  isActive: boolean;
  onClick: () => void;
}

const QuestionNavItem: React.FC<QuestionNavItemProps> = ({
  index,
  isAnswered,
  isActive,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center text-sm rounded-full 
        ${isActive ? 'ring-2 ring-blue-500' : ''}
        ${isAnswered 
          ? 'bg-green-100 border border-green-300 text-green-800' 
          : 'bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200'
        }`}
    >
      {index + 1}
    </button>
  );
};

// Main Quiz Page component
const QuizPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isTimeWarning, setIsTimeWarning] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Mock user ID for demonstration - in a real app, this would come from authentication
  const currentUserId = 'student1';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if user is enrolled in the course
        const enrollment = await enrollmentService.getEnrollment(currentUserId, courseId);
        if (!enrollment) {
          toast.error('Bạn cần đăng ký khóa học trước khi làm bài kiểm tra');
          router.push(`/courses/${courseId}`);
          return;
        }
        
        // Fetch quiz and course data
        const [quizData, courseData] = await Promise.all([
          quizService.getQuizById(quizId),
          courseService.getCourseById(courseId)
        ]);
        
        // Debug: log the quiz data to verify timeLimit
        console.log('Quiz data loaded:', {
          quizId: quizData._id,
          title: quizData.title,
          timeLimit: quizData.timeLimit,
          questions: quizData.questions.length
        });
        
        setQuiz(quizData);
        setCourse(courseData);
        
        // Use the actual timeLimit from quiz data (in minutes), converted to seconds
        // If timeLimit is not available, use 2 minutes per question as fallback
        const timeInSeconds = quizData.timeLimit 
          ? quizData.timeLimit * 60 
          : quizData.questions.length * 120;
        
        console.log(`Quiz timeLimit: ${quizData.timeLimit || 'N/A'} minutes, setting timer to ${timeInSeconds} seconds`);
        setRemainingTime(timeInSeconds);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Không thể tải thông tin bài kiểm tra');
        toast.error('Không thể tải thông tin bài kiểm tra');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, quizId, router]);

  // Timer effect
  useEffect(() => {
    if (!isConfirmed || remainingTime <= 0 || quizResult) return;
    
    // Check time warning
    if (remainingTime <= 60 && !isTimeWarning) {
      setIsTimeWarning(true);
      toast.error('Chỉ còn 1 phút nữa hết giờ!', { duration: 3000 });
    }
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!quizResult) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, quizResult, isTimeWarning, isConfirmed]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const scrollToQuestion = (index: number) => {
    setActiveQuestionIndex(index);
    const questionElements = document.querySelectorAll('.quiz-question');
    if (questionElements[index]) {
      questionElements[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getQuestionStats = () => {
    if (!quiz) return { total: 0, answered: 0, unanswered: 0 };
    
    const total = quiz.questions.length;
    const answered = Object.keys(selectedAnswers).length;
    const unanswered = total - answered;
    
    return { total, answered, unanswered };
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    const stats = getQuestionStats();
    if (stats.unanswered > 0 && remainingTime > 10) {
      const confirm = window.confirm(`Bạn còn ${stats.unanswered} câu hỏi chưa trả lời. Bạn có chắc chắn muốn nộp bài?`);
      if (!confirm) return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await quizService.submitQuiz({
        quizId,
        userId: currentUserId,
        answers: selectedAnswers
      });
      
      setQuizResult(result);
      
      // Update course progress after quiz completion
      const enrollment = await enrollmentService.getEnrollment(currentUserId, courseId);
      if (enrollment) {
        const newProgress = Math.min(100, enrollment.progress + 10);
        await enrollmentService.updateProgress(currentUserId, courseId, newProgress);
      }
      
      toast.success('Đã hoàn thành bài kiểm tra!');
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Không thể nộp bài kiểm tra');
    } finally {
      setIsSubmitting(false);
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

  if (!quiz || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Không tìm thấy bài kiểm tra
          </h2>
          <Link 
            href={`/courses/${courseId}`}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-primary-700"
          >
            Quay lại khóa học
          </Link>
        </div>
      </div>
    );
  }

  const questionStats = getQuestionStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbContainer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quiz header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <ChevronRight className="w-5 h-5 mr-1" />
            Quay lại khóa học
          </Link>
        </div>

        {/* Quiz title */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{quiz?.title}</h1>
          <p className="text-gray-600 mb-4">Khóa học: {course?.title}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-4 flex items-center">
              {quiz?.questions.length} câu hỏi
            </span>
            <span className="mr-4 flex items-center">
              Điểm đạt: {quiz?.passingScore}%
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Thời gian: {quiz?.timeLimit ? `${quiz?.timeLimit} phút` : "2 phút mỗi câu"}
            </span>
          </div>
        </div>

        {/* Quiz confirmation dialog */}
        {!isConfirmed && !quizResult && quiz && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Bạn đã sẵn sàng làm bài kiểm tra?</h2>
            <p className="text-gray-600 mb-6 text-center">
              Bài kiểm tra có {quiz.questions.length} câu hỏi và kéo dài 
              {quiz.timeLimit ? ` ${quiz.timeLimit} phút` : ` ${quiz.questions.length * 2} phút`}.
              Bạn cần hoàn thành trong thời gian quy định.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Quay lại
              </button>
              <button
                onClick={() => setIsConfirmed(true)}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        )}

        {/* Main content wrapper - Only show if confirmed */}
        {(isConfirmed || quizResult) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left column - Quiz questions */}
            <div className="lg:col-span-3">
              {/* Quiz result panel */}
              {quizResult && (
                <div className={`p-6 rounded-lg shadow-md mb-6 ${
                  quizResult.passed ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                }`}>
                  <div className="flex items-start">
                    {quizResult.passed ? (
                      <CheckCircle className="text-green-500 w-6 h-6 mr-3 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="text-red-500 w-6 h-6 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold mb-2">
                        {quizResult.passed ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra!' : 'Bạn chưa vượt qua bài kiểm tra!'}
                      </h2>
                      <p className="mb-2">
                        Điểm số: <span className="font-bold">{quizResult.score.toFixed(1)}%</span> 
                        (Đúng {quizResult.correctAnswers}/{quizResult.totalQuestions} câu)
                      </p>
                      <div className="mt-4 flex">
                        <Link
                          href={`/courses/${courseId}`}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-primary-700 mr-3"
                        >
                          Quay lại khóa học
                        </Link>
                        {!quizResult.passed && (
                          <button
                            onClick={() => {
                              setQuizResult(null);
                              setSelectedAnswers({});
                              setRemainingTime(quiz.questions.length * 120);
                              setIsTimeWarning(false);
                              setIsConfirmed(false); // Reset confirmation state to show the dialog again
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                          >
                            Làm lại bài kiểm tra
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timer notification at top of questions */}
              {!quizResult && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  remainingTime < 60 
                    ? 'border-red-500 bg-red-50 animate-pulse' 
                    : remainingTime < 300 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className={`w-6 h-6 mr-3 ${
                        remainingTime < 60 
                          ? 'text-red-600' 
                          : remainingTime < 300 
                            ? 'text-yellow-600' 
                            : 'text-blue-600'
                      }`} />
                      <div>
                        <div className="font-semibold">
                          {remainingTime < 60 
                            ? 'SẮP HẾT THỜI GIAN!' 
                            : remainingTime < 300 
                              ? 'Thời gian còn ít' 
                              : 'Thời gian làm bài'
                          }
                        </div>
                        <p className="text-sm text-gray-600">
                          {remainingTime < 60 
                            ? 'Vui lòng nộp bài ngay!' 
                            : remainingTime < 300 
                              ? 'Hãy nhanh chóng hoàn thành bài làm' 
                              : 'Hãy cân nhắc thời gian để hoàn thành tất cả câu hỏi'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatTime(remainingTime)}
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz questions */}
              {!quizResult && (
                <div className="space-y-6">
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="quiz-question">
                      <QuizQuestion
                        question={question.question}
                        options={question.options}
                        questionIndex={index}
                        selectedAnswer={selectedAnswers[index] || null}
                        onSelectAnswer={(answer) => handleSelectAnswer(index, answer)}
                        isSubmitted={false}
                      />
                    </div>
                  ))}
                  
                  {/* Submit button - now at the bottom of the page, not sticky */}
                  <div className="py-4 mt-10">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-1">Nộp bài kiểm tra</h3>
                        <p className="text-gray-600">
                          Bạn đã trả lời {questionStats.answered}/{questionStats.total} câu hỏi
                          {questionStats.unanswered > 0 ? ` (còn ${questionStats.unanswered} câu chưa trả lời)` : ''}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(questionStats.answered / questionStats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || questionStats.answered === 0}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-70 disabled:shadow-none flex items-center justify-center min-w-[200px]"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Đang nộp bài...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">📝</span>
                              Nộp bài
                            </>
                          )}
                        </button>
                      </div>
                      
                      {questionStats.unanswered > 0 && (
                        <div className="flex items-center justify-center mt-4 text-sm text-yellow-700">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Bạn vẫn còn câu hỏi chưa trả lời. Hãy kiểm tra lại!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quiz result details */}
              {quizResult && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h2 className="text-xl font-bold mb-4">Chi tiết kết quả</h2>
                  {quiz.questions.map((question, index) => (
                    <QuizQuestion
                      key={index}
                      question={question.question}
                      options={question.options}
                      questionIndex={index}
                      selectedAnswer={selectedAnswers[index] || null}
                      onSelectAnswer={() => {}}
                      isSubmitted={true}
                      correctAnswer={question.correctAnswer}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Right column - Quiz summary and navigation */}
            <div className="lg:col-span-1">
              {/* Quiz progress panel */}
              {!quizResult && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <h3 className="font-semibold text-lg mb-3">Tiến trình bài làm</h3>
                  
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-600">Đã trả lời</div>
                    <div className="font-medium">{questionStats.answered}/{questionStats.total}</div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(questionStats.answered / questionStats.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  {questionStats.unanswered > 0 && (
                    <div className="flex items-start p-2 bg-yellow-50 rounded-lg text-sm">
                      <AlertTriangle className="text-yellow-500 w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        Bạn còn {questionStats.unanswered} câu hỏi chưa trả lời.
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Question navigation */}
              {!quizResult && quiz.questions.length > 1 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-lg mb-3">Danh sách câu hỏi</h3>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {quiz.questions.map((_, index) => (
                      <QuestionNavItem 
                        key={index}
                        index={index}
                        isAnswered={selectedAnswers[index] !== undefined}
                        isActive={activeQuestionIndex === index}
                        onClick={() => scrollToQuestion(index)}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-4 flex text-sm text-gray-500 justify-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-1"></div>
                      <span>Đã trả lời</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full mr-1"></div>
                      <span>Chưa trả lời</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Result summary panel */}
              {quizResult && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-lg mb-3">Tổng kết kết quả</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Tổng số câu hỏi</span>
                      <span className="font-medium">{quizResult.totalQuestions}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Số câu trả lời đúng</span>
                      <span className="font-medium text-green-600">{quizResult.correctAnswers}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Số câu trả lời sai</span>
                      <span className="font-medium text-red-600">
                        {quizResult.totalQuestions - quizResult.correctAnswers}
                      </span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Điểm đạt yêu cầu</span>
                      <span className="font-medium">{quiz.passingScore}%</span>
                    </div>
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Điểm của bạn</span>
                      <span className={quizResult.passed ? "text-green-600" : "text-red-600"}>
                        {quizResult.score.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                      quizResult.passed 
                        ? "bg-green-50 text-green-700" 
                        : "bg-red-50 text-red-700"
                    }`}>
                      {quizResult.passed 
                        ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra." 
                        : "Bạn chưa đạt yêu cầu. Hãy thử lại!"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage; 