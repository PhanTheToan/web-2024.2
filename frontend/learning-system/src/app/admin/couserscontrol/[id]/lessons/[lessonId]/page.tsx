"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Trash, Clock, Calendar, 
  FileText, AlertCircle, Loader2, Play,
  Eye, Download, ExternalLink, File
} from 'lucide-react';
import { Course, Lesson, LessonMaterial } from '@/app/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course data directly using API
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
        
        // Fetch lesson data using API
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
        
        if (lessonData.body) {
          setLesson(lessonData.body);
          
          // Set first PDF as selected if available
          if (lessonData.body.materials && lessonData.body.materials.length > 0) {
            const pdfMaterial = lessonData.body.materials.find(
              (m: string) => m.toLowerCase().endsWith('.pdf')
            );
            if (pdfMaterial) {
              setSelectedPdf(pdfMaterial);
            }
          }
        } else {
          setLesson(lessonData);
          
          // Set first PDF as selected if available
          if (lessonData.materials && lessonData.materials.length > 0) {
            const pdfMaterial = lessonData.materials.find(
              (m: string) => m.toLowerCase().endsWith('.pdf')
            );
            if (pdfMaterial) {
              setSelectedPdf(pdfMaterial);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId && lessonId) {
      fetchData();
    }
  }, [courseId, lessonId]);
  
  const handleDeleteLesson = async () => {
    if (!course || !lesson) return;
    
    try {
      setDeleting(true);
      
      // Use direct API call to delete lesson
      const url = `${API_BASE_URL}/course/delete-lesson/${lessonId}?courseId=${courseId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa bài học');
      }
      
      toast.success('Bài học đã được xóa thành công!');
      router.push(`/admin/couserscontrol/${courseId}`);
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      setError('Không thể xóa bài học. Vui lòng thử lại sau.');
      toast.error('Không thể xóa bài học. Vui lòng thử lại sau.');
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };
  
  // Add helper functions to handle material types
  const getMaterialPath = (material: string | LessonMaterial): string => {
    if (typeof material === 'string') {
      return material;
    }
    return material.path;
  };
  
  // Function to check if file is a PDF
  const isPdf = (material: string | LessonMaterial): boolean => {
    const path = typeof material === 'string' ? material : material.path;
    return path.toLowerCase().endsWith('.pdf');
  };
  
  // Function to get file name from path
  const getFileName = (material: string | LessonMaterial): string => {
    const path = typeof material === 'string' ? material : material.path;
    return path.split('/').pop() || path;
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
        <Link href={`/admin/couserscontrol/${courseId}`} className="text-primary-600 hover:text-primary-800 flex items-center">
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
        <Link href="/admin/couserscontrol" className="text-primary-600 hover:text-primary-800 flex items-center">
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
        <Link href="/admin/couserscontrol" className="text-gray-500 hover:text-gray-700 mr-2">
          Quản lý khóa học
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href={`/admin/couserscontrol/${courseId}`} className="text-gray-500 hover:text-gray-700 mr-2">
          {course.title}
        </Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-900 font-medium">Bài học: {lesson.title}</span>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href={`/admin/couserscontrol/${courseId}`}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại khóa học
        </Link>
        
        <div className="flex space-x-3">
          <Link
            href={`/admin/couserscontrol/${courseId}/lessons/${lessonId}/edit`}
            className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
          
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700"
          >
            <Trash className="w-4 h-4 mr-2" />
            Xóa bài học
          </button>
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
              <p className="text-gray-500 mt-1">{lesson.description || 'Không có mô tả'}</p>
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
                  <p className="font-medium">{lesson.createdAt ? formatDate(lesson.createdAt.toString()) : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FileText className="text-gray-400 w-5 h-5 mr-2" />
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
          </div>
          
          {/* Lesson content */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Nội dung bài học</h3>
            </div>
            <div className="p-4">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
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
                {/* For demo only. In a real app, this would be a proper video player component */}
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
          {selectedPdf && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Xem trước tài liệu PDF</h3>
                <div className="flex space-x-2">
                  <a
                    href={selectedPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-600 hover:text-primary-800 hover:bg-gray-100 rounded"
                    title="Mở trong tab mới"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <a
                    href={selectedPdf}
                    download
                    className="p-2 text-primary-600 hover:text-primary-800 hover:bg-gray-100 rounded"
                    title="Tải xuống PDF"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="p-4">
                <iframe
                  src={`${selectedPdf}#toolbar=0&navpanes=0`}
                  className="w-full h-[600px] border rounded"
                  title="PDF Viewer"
                ></iframe>
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Sidebar */}
        <div className="lg:col-span-1">
          {/* Course info */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Thuộc khóa học</h3>
            </div>
            <div className="p-4">
              <Link 
                href={`/admin/couserscontrol/${courseId}`}
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
                  {lesson.materials.map((material, idx) => {
                    const materialPath = getMaterialPath(material);
                    return (
                    <li 
                      key={idx} 
                      className={`flex items-start p-3 rounded-md ${
                        isPdf(material) ? 'cursor-pointer hover:bg-gray-50' : ''
                      } ${selectedPdf === materialPath ? 'bg-gray-100' : ''}`}
                      onClick={() => isPdf(material) && setSelectedPdf(materialPath)}
                    >
                      {isPdf(material) ? (
                        <FileText className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <File className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      
                      <div className="flex-grow">
                        <div className="font-medium text-sm break-words">
                          {getFileName(material)}
                        </div>
                        
                        <div className="flex mt-2 space-x-2">
                          {isPdf(material) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPdf(materialPath);
                              }}
                              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Xem
                            </button>
                          )}
                          
                          <a
                            href={materialPath}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Tải xuống
                          </a>
                          
                          <a
                            href={materialPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Mở
                          </a>
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500">Không có tài liệu bổ sung</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bài học <span className="font-semibold">&quot;{lesson.title}&quot;</span>? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteLesson}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4 mr-2" />
                    Xóa bài học
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 