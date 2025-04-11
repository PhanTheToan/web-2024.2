"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Clock, AlertTriangle, AlertCircle, CheckCircle, ChevronRight, BookOpen, Lock, PlayCircle } from "lucide-react";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

// Types for quiz data
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer?: string;
}

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
  orderQuiz?: number;
  createdAt: Date;
}

interface Course {
  _id: string;
  id?: string;
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

// Interface for content items (lessons and quizzes)
interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  order: number;
  type: 'lesson' | 'quiz';
  complete?: boolean;
  currentlyLearning?: boolean;
  timeLimit?: number;
  lessonId?: string;
  quizId?: string;
  orderLesson?: number;
  orderQuiz?: number;
}

// Response structure for the lesson_quiz endpoint
interface LessonQuizResponse {
  body: {
    notLearned?: {
      quizzes: Array<{
        quizId: string;
        title: string;
        questionCount: number;
        orderQuiz: number;
        passingScore: number;
      }>;
      lessons: Array<{
        lessonId: string;
        lessonTitle: string;
        lessonShortTitle: string;
        orderLesson: number;
      }>;
    };
    learned?: {
      quizzes: Array<{
        quizId: string;
        title: string;
        questionCount: number;
        orderQuiz: number;
        passingScore: number;
      }>;
      lessons: Array<{
        lessonId: string;
        lessonTitle: string;
        lessonShortTitle: string;
        orderLesson: number;
      }>;
    };
  };
  statusCodeValue: number;
  statusCode: string;
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
  const [isTimeWarning, setIsTimeWarning] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseContent, setCourseContent] = useState<ContentItem[]>([]);

  // Check user authentication
  const checkUserAuth = async () => {
    try {
      // Use the auth/check endpoint for both auth and enrollment check
      console.log('Checking user authentication');
      const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!authResponse.ok) {
        console.log('User is not authenticated');
        setIsAuthenticated(false);
        setIsEnrolled(false);
        return false;
      }

      const authData = await authResponse.json();
      console.log('Auth data:', authData);
      
      let userIsEnrolled = false;
      
      // Check if authentication was successful (status 200)
      if (authData.status === 200 && authData.message === 'User authenticated') {
        console.log('User is authenticated');
        setIsAuthenticated(true);
        
        // Check if the courseId is in the user's enrolled courses list
        if (authData.data && Array.isArray(authData.data.coursesEnrolled)) {
          console.log('User courses:', authData.data.coursesEnrolled);
          
          // Check if the current courseId is in the enrolled courses array
          if (authData.data.coursesEnrolled.includes(courseId)) {
            console.log('User is enrolled in this course');
            userIsEnrolled = true;
            setIsEnrolled(true);
          } else {
            console.log('User is not enrolled in this course');
            setIsEnrolled(false);
          }
        } else {
          console.log('No courses enrolled or invalid data format');
          setIsEnrolled(false);
        }
      } else {
        console.log('Authentication failed:', authData.message);
        setIsAuthenticated(false);
        setIsEnrolled(false);
      }
      
      return userIsEnrolled;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setIsEnrolled(false);
      return false;
    }
  };

  // Fetch course content from the API
  const fetchCourseContent = async (userIsEnrolled = false) => {
    try {
      // First API to get content structure and ordering
      const orderEndpoint = `${API_BASE_URL}/course/lesson_quiz/${courseId}`;
      console.log('Fetching content structure from:', orderEndpoint);
      
      const orderResponse = await fetch(orderEndpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to fetch course structure');
      }

      const orderData = await orderResponse.json();
      console.log('Course structure data:', orderData);
      
      const initialItems: ContentItem[] = [];
      
      // Process lessons from the order API
      if (orderData.body && orderData.body.lessons) {
        orderData.body.lessons.forEach((lesson: any) => {
          initialItems.push({
            _id: lesson.lessonId,
            title: lesson.lessonTitle || '',
            description: lesson.lessonShortTitle || '',
            order: lesson.orderLesson,
            orderLesson: lesson.orderLesson,
            type: 'lesson',
            complete: false,
            currentlyLearning: false,
            lessonId: lesson.lessonId
          });
        });
      }
      
      // Process quizzes from the order API
      if (orderData.body && orderData.body.quizzes) {
        orderData.body.quizzes.forEach((quiz: any) => {
          initialItems.push({
            _id: quiz.quizId,
            title: 'Quiz',
            order: quiz.orderQuiz,
            orderQuiz: quiz.orderQuiz,
            type: 'quiz',
            complete: false,
            currentlyLearning: false,
            quizId: quiz.quizId,
            timeLimit: quiz.timeLimit
          });
        });
      }
      
      // Sort items by order
      initialItems.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // If user is enrolled, fetch the second API for learning status
      if (userIsEnrolled) {
        // Second API to get learning status
        const statusEndpoint = `${API_BASE_URL}/course/lesson-quiz/${courseId}`;
        console.log('Fetching learning status from:', statusEndpoint);
        
        const statusResponse = await fetch(statusEndpoint, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json() as LessonQuizResponse;
          console.log('Learning status data:', statusData);
          
          // Mark completed items based on the status API response
          if (statusData.body) {
            // Process learned lessons
            if (statusData.body.learned?.lessons) {
              statusData.body.learned.lessons.forEach(lesson => {
                const existingItem = initialItems.find(item => 
                  item.type === 'lesson' && item._id === lesson.lessonId
                );
                
                if (existingItem) {
                  existingItem.complete = true;
                }
              });
            }
            
            // Process learned quizzes
            if (statusData.body.learned?.quizzes) {
              statusData.body.learned.quizzes.forEach(quiz => {
                const existingItem = initialItems.find(item => 
                  item.type === 'quiz' && item._id === quiz.quizId
                );
                
                if (existingItem) {
                  existingItem.complete = true;
                }
              });
            }
          }
        }
      }
      
      // Mark the current quiz as "currently learning"
      const currentQuizIndex = initialItems.findIndex(item => 
        item.type === 'quiz' && item._id === quizId
      );
      
      if (currentQuizIndex !== -1) {
        initialItems[currentQuizIndex].currentlyLearning = true;
      }
      
      setCourseContent(initialItems);
      return initialItems;
    } catch (error) {
      console.error('Error fetching course content:', error);
      throw error;
    }
  };

  // Fetch quiz data from API
  const fetchQuizData = async () => {
    try {
      const quizResponse = await fetch(`${API_BASE_URL}/course/quiz/${quizId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!quizResponse.ok) {
        throw new Error('Failed to fetch quiz data');
      }

      const quizData = await quizResponse.json();
      console.log('Quiz data:', quizData);
      
      // Parse the response to match our Quiz interface
      const parsedQuiz: Quiz = {
        _id: quizData.body.id || quizData.body._id,
        courseId: quizData.body.courseId,
        title: quizData.body.title,
        description: quizData.body.description,
        questions: quizData.body.questions || [],
        passingScore: quizData.body.passingScore || 70,
        timeLimit: quizData.body.timeLimit || 30,
        order: quizData.body.order || quizData.body.orderQuiz,
        createdAt: new Date(quizData.body.createdAt)
      };
      
      setQuiz(parsedQuiz);
      return parsedQuiz;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  };

  // Fetch course info
  const fetchCourseInfo = async () => {
    try {
      const courseResponse = await fetch(`${API_BASE_URL}/course/info/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course data');
      }

      const courseData = await courseResponse.json();
      console.log('Course data:', courseData);
      
      const parsedCourse: Course = {
        _id: courseData.body.id || courseData.body._id,
        title: courseData.body.title,
        description: courseData.body.description
      };
      
      setCourse(parsedCourse);
      return parsedCourse;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if user is authenticated and enrolled
        const userIsEnrolled = await checkUserAuth();
        
        if (!isAuthenticated) {
          console.log('User is not authenticated');
          toast.error('Bạn cần đăng nhập để làm bài kiểm tra');
          // router.push('/auth/login?redirect=' + encodeURIComponent(`/courses/${courseId}/quiz/${quizId}`));
          return;
        }
        
        if (!userIsEnrolled) {
          console.log('User is not enrolled in this course');
          toast.error('Bạn cần đăng ký khóa học trước khi làm bài kiểm tra');
          // router.push(`/courses/${courseId}`);
          return;
        }
        
        // Fetch quiz, course content, and course info in parallel
        const [quizData, parsedCourse] = await Promise.all([
          fetchQuizData(),
          fetchCourseInfo()
        ]);
        
        console.log('Course data loaded:', parsedCourse.title);
        
        // Fetch course content after quiz data is available
        await fetchCourseContent(userIsEnrolled);
        
        // Use the timeLimit from quiz data (in minutes), converted to seconds
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
  }, [courseId, quizId, router, isAuthenticated]);

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
      // Format answers for the API
      const answers = Object.entries(selectedAnswers).map(([questionIndex, selectedAnswer]) => {
        const question = quiz.questions[parseInt(questionIndex)];
        return {
          question: question.question,
          selectedAnswer
        };
      });
      
      // Call the submit API with the formatted answers
      const response = await fetch(`${API_BASE_URL}/course/quiz/${quizId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      const data = await response.json();
      console.log('Quiz submission response:', data);
      
      // Process API response to match our QuizResult interface
      const correctAnswers = data.body?.correctAnswers || 0;
      const totalQuestions = quiz.questions.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= (quiz.passingScore || 70);
      
      // Create a QuizResult object
      const result: QuizResult = {
        score,
        totalQuestions,
        correctAnswers,
        passed,
        feedback: data.body?.feedback || []
      };
      
      setQuizResult(result);
      
      // Refresh course content to update completed items
      await fetchCourseContent(true);
      
      toast.success('Đã hoàn thành bài kiểm tra!');
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Không thể nộp bài kiểm tra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a content item is accessible
  const isContentItemAccessible = (item: ContentItem): boolean => {
    // If the item is the current quiz, it's accessible
    if (item.type === 'quiz' && item._id === quizId) return true;
    
    // If item is already marked as completed, it's accessible
    if (item.complete) return true;
    
    // Get the index of this item and the current quiz
    const itemIndex = courseContent.findIndex(i => i._id === item._id);
    const currentQuizIndex = courseContent.findIndex(i => 
      i.type === 'quiz' && i._id === quizId
    );
    
    if (currentQuizIndex === -1) return false;
    
    // Allow access to items before current quiz
    if (itemIndex < currentQuizIndex) return true;
    
    // For items beyond current, check if all previous items are completed
    if (itemIndex > currentQuizIndex) {
      // Check if all items between current and target are completed
      for (let i = currentQuizIndex; i < itemIndex; i++) {
        if (!courseContent[i].complete) return false;
      }
      return true;
    }
    
    return false;
  };

  // Handle content item navigation
  const handleContentItemClick = (e: React.MouseEvent, item: ContentItem) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('Bạn cần đăng nhập để truy cập nội dung này');
      router.push('/auth/login?redirect=' + encodeURIComponent(`/courses/${courseId}/quiz/${quizId}`));
      return;
    }
    
    if (!isEnrolled) {
      e.preventDefault();
      toast.error('Bạn cần đăng ký khóa học để truy cập nội dung này');
      return;
    }
    
    if (!isContentItemAccessible(item)) {
      e.preventDefault();
      toast.error('Bạn cần hoàn thành các nội dung trước để mở khóa nội dung này');
      return;
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

        {/* Main content wrapper with sidebar - Update this section */}
        {(isConfirmed || quizResult) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar with course content */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
                <h3 className="text-xl font-medium mb-4 flex items-center border-b pb-3">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Nội dung khóa học
                </h3>
                
                <div className="space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
                  {courseContent.length > 0 ? (
                    <>
                      {/* Group and sort content by type and order */}
                      {(() => {
                        // First separate lessons and quizzes
                        const lessons = courseContent.filter(item => item.type === 'lesson');
                        const quizzes = courseContent.filter(item => item.type === 'quiz');
                        
                        // Group by lesson or order
                        const grouped = [];
                        
                        // First add main lessons
                        for (const lesson of lessons) {
                          const lessonGroup = {
                            header: lesson,
                            items: quizzes.filter(quiz => {
                              // Find quizzes that belong to this lesson based on order
                              // Assuming quizzes come after their respective lessons
                              const quizOrder = quiz.order || quiz.orderQuiz || 0;
                              const thisLessonOrder = lesson.order || lesson.orderLesson || 0;
                              const nextLessonOrder = lessons.find(l => 
                                (l.order || l.orderLesson || 0) > thisLessonOrder
                              )?.order || 999999;
                              
                              return quizOrder > thisLessonOrder && quizOrder < nextLessonOrder;
                            })
                          };
                          
                          grouped.push(lessonGroup);
                        }
                        
                        // Return the rendered content
                        return grouped.map((group, groupIndex) => (
                          <div key={`lesson-group-${groupIndex}`} className="mb-4">
                            {/* Section header */}
                            <div className={`py-2 px-3 rounded mb-1 flex items-center ${
                              group.header.complete 
                                ? 'text-gray-800 font-medium' 
                                : (!isContentItemAccessible(group.header) && group.header._id !== quizId)
                                  ? 'text-gray-400'
                                  : 'text-gray-800 font-medium'
                            }`}>
                              <BookOpen className="mr-2 w-4 h-4" />
                              <span className="truncate">{group.header.title}</span>
                              {!isContentItemAccessible(group.header) && group.header._id !== quizId && (
                                <Lock className="ml-auto w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            
                            {/* Main lesson (if it's not just a header) */}
                            <Link
                              href={isContentItemAccessible(group.header) 
                                ? `/courses/${courseId}/lesson/${group.header._id}` 
                                : '#'}
                              className={`py-2 px-3 ml-4 rounded flex items-center ${
                                !isContentItemAccessible(group.header) 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : group.header._id === quizId
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'hover:bg-gray-50'
                              }`}
                              onClick={(e) => !isContentItemAccessible(group.header) && handleContentItemClick(e, group.header)}
                            >
                              <BookOpen className={`mr-2 w-4 h-4 ${
                                group.header._id === quizId ? 'text-blue-500' : 'text-gray-500'
                              }`} />
                              <span className="truncate flex-1">{group.header.title}</span>
                              {group.header.complete ? (
                                <CheckCircle className="ml-1 w-4 h-4 text-green-500" />
                              ) : !isContentItemAccessible(group.header) && group.header._id !== quizId ? (
                                <Lock className="ml-1 w-4 h-4 text-gray-400" />
                              ) : null}
                            </Link>
                            
                            {/* Quizzes for this section */}
                            {group.items.map((quiz, idx) => (
                              <Link
                                key={`quiz-${quiz._id}-${idx}`}
                                href={isContentItemAccessible(quiz) 
                                  ? `/courses/${courseId}/quiz/${quiz._id}` 
                                  : '#'}
                                className={`py-2 px-3 ml-4 rounded flex items-center ${
                                  !isContentItemAccessible(quiz) && quiz._id !== quizId
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : quiz._id === quizId
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'hover:bg-gray-50'
                                }`}
                                onClick={(e) => !isContentItemAccessible(quiz) && quiz._id !== quizId && handleContentItemClick(e, quiz)}
                              >
                                <Clock className={`mr-2 w-4 h-4 ${
                                  quiz._id === quizId ? 'text-blue-500' : 'text-gray-500'
                                }`} />
                                <span className="truncate flex-1">Quiz</span>
                                {quiz.complete ? (
                                  <div className="ml-1 p-0.5 bg-blue-500 text-white rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                  </div>
                                ) : quiz._id === quizId ? (
                                  <div className="ml-1 p-0.5 bg-blue-500 text-white rounded-full">
                                    <PlayCircle className="w-3 h-3" />
                                  </div>
                                ) : !isContentItemAccessible(quiz) ? (
                                  <Lock className="ml-1 w-4 h-4 text-gray-400" />
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        ));
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>Đang tải nội dung khóa học...</p>
                    </div>
                  )}
                </div>
                
                {isEnrolled && courseContent.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2 flex justify-between">
                      <span>Tiến độ khóa học:</span>
                      <span className="font-medium">{Math.round((courseContent.filter(item => item.complete).length / courseContent.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(courseContent.filter(item => item.complete).length / courseContent.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Main quiz content - keep existing content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage; 