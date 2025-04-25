"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Clock, Calendar, 
  AlertCircle, Loader2, Play,
  File, X
} from 'lucide-react';
import { Course } from '@/app/types';
import { formatDate } from '@/lib/utils';
import dotenv from 'dotenv';
dotenv.config();
// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

// Define Lesson interface based on API response
interface Lesson {
  id: string;
  courseId: string;
  title: string;
  shortTile: string | null;
  content: string;
  videoUrl: string | null;
  materials: string[];
  order: number;
  timeLimit: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Thêm interface mở rộng để hỗ trợ trường status
interface ExtendedLesson extends Lesson {
  status?: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<ExtendedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

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
        
        // Fetch lesson data using the API from screenshot
        console.log("Fetching lesson:", lessonId);
        const lessonResponse = await fetch(`${API_BASE_URL}/course/get-lesson/${lessonId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!lessonResponse.ok) {
          throw new Error("Failed to fetch lesson");
        }

        const lessonData = await lessonResponse.json();
        console.log("Lesson data:", lessonData);
        
        setLesson(lessonData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, lessonId]);

  // Function to check if a material is a PDF
  const isPdf = (url: string): boolean => {
    return url.toLowerCase().endsWith('.pdf') || url.includes('pdf');
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
  
  if (!course || !lesson) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Không tìm thấy dữ liệu bài học hoặc khóa học.</span>
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
        <span className="text-gray-900 font-medium">Bài học: {lesson.title}</span>
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
            href={`/teacher/courses/${courseId}/lessons/${lessonId}/edit`}
            className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Lesson info */}
        <div className="lg:col-span-2">
          {/* Lesson info cards */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b p-4">
              <h2 className="text-xl font-bold">{lesson.title}</h2>
              <p className="text-gray-500 mt-1">{lesson.shortTile || 'Không có mô tả'}</p>
            </div>
            
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Clock className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Thứ tự</p>
                  <p className="font-medium">{lesson.order || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="font-medium">{formatDate(lesson.createdAt.toString())}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <File className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Tài liệu</p>
                  <p className="font-medium">{lesson.materials?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Play className="text-gray-400 w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Video</p>
                  <p className="font-medium">{lesson.videoUrl ? 'Có' : 'Không'}</p>
                </div>
              </div>
            </div>
            
            {/* Thêm phần hiển thị trạng thái */}
            <div className="p-4 border-t">
              <h3 className="text-sm font-medium mb-2">Trạng thái bài học:</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                lesson.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  lesson.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                {lesson.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {lesson.status === 'ACTIVE'
                  ? "Bài học đang được kích hoạt. Học viên có thể truy cập bài học này."
                  : "Bài học đang bị vô hiệu hóa. Học viên không thể truy cập bài học này."}
              </p>
            </div>
          </div>
          
          {/* Lesson content */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Nội dung bài học</h3>
            </div>
            <div className="p-4">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          </div>
          
          {/* Video preview if available */}
          {lesson.videoUrl && (
            <div className="mb-6 bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold">Video bài học</h3>
              </div>
              <div className="p-4">
                <div className="relative aspect-video">
                  <iframe
                    className="absolute w-full h-full rounded-md"
                    src={lesson.videoUrl}
                    title={`Video for ${lesson.title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}
          
          {/* PDF Viewer Section */}
          {selectedPdf && isPdf(selectedPdf) && (
            <div className="mb-6 bg-white rounded-lg shadow">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Xem tài liệu PDF</h3>
                <button 
                  onClick={() => setSelectedPdf(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={selectedPdf}
                    className="absolute w-full h-full"
                    title="PDF Viewer"
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - sidebar */}
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
                Số bài học: {Array.isArray(course.lessons) ? course.lessons.length : 0}
              </p>
            </div>
          </div>
          
          {/* Additional materials */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Tài liệu bổ sung</h3>
            </div>
            <div className="p-4">
              {lesson.materials && lesson.materials.length > 0 ? (
                <ul className="space-y-3">
                  {lesson.materials.map((material, idx) => (
                    <li 
                      key={idx} 
                      className={`flex items-start p-3 rounded-md ${
                        isPdf(material) ? 'cursor-pointer hover:bg-gray-50' : ''
                      } ${selectedPdf === material ? 'bg-gray-100' : ''}`}
                      onClick={() => isPdf(material) && setSelectedPdf(material)}
                    >
                      <File className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {material.split('/').pop() || 'Tài liệu'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {isPdf(material) ? (
                            <span className="text-blue-600 hover:underline">Nhấn để xem</span>
                          ) : (
                            <a 
                              href={material}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline"
                            >
                              Tải xuống
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Không có tài liệu bổ sung</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 