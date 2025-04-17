"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Clock, Calendar, 
  AlertCircle, Loader2, CheckCircle, 
  List, Award, HelpCircle
} from 'lucide-react';
import { Course } from '@/app/types';
import { formatDate } from '@/lib/utils';

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
  const courseId = params.id as string;
  const quizId = params.quizId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, quizId]);
  
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
                    
                    {question.material && (
                      <div className="ml-8 mb-3">
                        <img 
                          src={question.material} 
                          alt={`Hình ảnh cho câu hỏi ${index + 1}`} 
                          className="max-h-36 rounded border mb-2"
                        />
                      </div>
                    )}
                    
                    <div className="ml-8 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isCorrect = option === question.correctAnswer;
                        
                        return (
                          <div 
                            key={optionIndex}
                            className={`flex items-start p-2 rounded-md ${
                              isCorrect ? 'bg-green-50 border border-green-100' : ''
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-gray-300 mr-2 flex-shrink-0" />
                            )}
                            <span className={isCorrect ? 'font-medium' : ''}>
                              {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Không có câu hỏi nào được tạo cho bài kiểm tra này.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {/* Course info */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Thuộc khóa học</h3>
            </div>
            <div className="p-4">
              <Link 
                href={`/teacher/courses/${courseId}`}
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
    </div>
  );
} 