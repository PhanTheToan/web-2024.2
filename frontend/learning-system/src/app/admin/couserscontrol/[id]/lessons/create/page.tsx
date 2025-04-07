"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, X, FileText } from 'lucide-react';
import { Course } from '@/app/types';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { lessonService } from '@/services/lessonService';

export default function CreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    order: 0,
    timeLimit: 30, // Default to 30 minutes
    materials: [] as { name: string; path: string; size: number }[],
  });

  // Additional state for file upload
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData as Course);
        
        // Set default order to be after the last lesson
        if (courseData && courseData.lessons && courseData.lessons.length > 0) {
          setFormData(prev => ({
            ...prev,
            order: courseData.lessons.length + 1
          }));
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Không thể tải thông tin khóa học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    });
  };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      videoUrl: value,
    });
    
    // For demo purposes only - in real app, validate URL
    setVideoPreview(value);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingFiles(true);
    
    // Process each file
    Array.from(files).forEach((file) => {
      // Check if it's a PDF
      if (file.type !== 'application/pdf') {
        setError('Chỉ chấp nhận file PDF');
        setUploadingFiles(false);
        return;
      }
      
      // Check file size (limit to 10MB for example)
      if (file.size > 10 * 1024 * 1024) {
        setError('File quá lớn. Kích thước tối đa là 10MB');
        setUploadingFiles(false);
        return;
      }
      
      // In a real app, you would upload the file to a server/storage
      // For now, we'll simulate a successful upload
      setTimeout(() => {
        // Create a fake server path
        const serverPath = `/uploads/materials/${file.name}`;
        
        // Add to materials
        setFormData(prev => ({
          ...prev,
          materials: [
            ...prev.materials,
            {
              name: file.name,
              path: serverPath,
              size: file.size
            }
          ]
        }));
        
        setUploadingFiles(false);
        setError(null);
      }, 1000);
    });
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeMaterial = (index: number) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials.splice(index, 1);
    setFormData({
      ...formData,
      materials: updatedMaterials,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Tiêu đề bài học không được để trống');
      }
      
      if (!formData.content.trim()) {
        throw new Error('Nội dung bài học không được để trống');
      }
      
      // Prepare lesson data
      const lessonData = {
        ...formData,
        // Extract just the paths for the API
        materials: formData.materials.map(material => material.path),
        courseId,
        _id: `lesson-${Date.now()}`, // In real app, this would be generated by the backend
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Call the lesson service API to create the lesson
      const newLesson = await lessonService.createLesson(lessonData);
      console.log('Lesson created successfully:', newLesson);
      
      setSuccess('Bài học đã được tạo thành công!');
      toast.success('Bài học đã được tạo thành công!');
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}`);
      }, 1500);
      
    } catch (error: unknown) {
      console.error('Failed to create lesson:', error);
      if (error instanceof Error) {
        setError(error.message || 'Không thể tạo bài học. Vui lòng thử lại sau.');
        toast.error(error.message || 'Không thể tạo bài học. Vui lòng thử lại sau.');
      } else {
        setError('Không thể tạo bài học. Vui lòng thử lại sau.');
        toast.error('Không thể tạo bài học. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu khóa học...</span>
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-2">
        <Link 
          href={`/admin/couserscontrol/${courseId}`} 
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Thêm bài học mới</h1>
      </div>
      
      <p className="text-gray-500 mb-6">Cho khóa học: <span className="font-medium">{course.title}</span></p>
      
      {/* Alert messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Tiêu đề bài học <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Nhập tiêu đề bài học"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Mô tả ngắn
            </label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Mô tả ngắn về bài học"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="content">
              Nội dung bài học <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              placeholder="Nhập nội dung chi tiết của bài học"
              className="w-full px-3 py-2 border rounded-md h-40"
              value={formData.content}
              onChange={handleChange}
            ></textarea>
            <p className="text-gray-500 text-sm mt-1">Nội dung có thể bao gồm định dạng HTML</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="videoUrl">
              URL video bài học
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="text"
              placeholder="Nhập URL video bài học (YouTube, Vimeo,...)"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.videoUrl}
              onChange={handleVideoChange}
            />
            
            {videoPreview && (
              <div className="mt-3 border rounded-md p-2">
                <p className="text-sm font-medium mb-2">Xem trước video:</p>
                <div className="max-w-lg mx-auto">
                  {/* Hiển thị video hoặc hình ảnh đại diện */}
                  <Image 
                    src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" 
                    alt="Video preview" 
                    width={320}
                    height={180}
                    unoptimized
                    className="rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL: {videoPreview}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="order">
              Thứ tự bài học
            </label>
            <input
              id="order"
              name="order"
              type="number"
              min="1"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.order}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="timeLimit">
              Thời gian học (phút) <span className="text-red-500">*</span>
            </label>
            <input
              id="timeLimit"
              name="timeLimit"
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.timeLimit}
              onChange={handleChange}
              placeholder="Nhập thời gian học (phút)"
            />
            <p className="text-gray-500 text-sm mt-1">Thời gian ước tính để hoàn thành bài học này</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Tài liệu bổ sung
            </label>
            
            {/* File upload section */}
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input
                type="file"
                id="fileUpload"
                ref={fileInputRef}
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="space-y-2">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="fileUpload" className="cursor-pointer font-medium text-primary-600 hover:text-primary-700">
                    Tải lên tài liệu PDF
                  </label> hoặc kéo và thả
                </div>
                <p className="text-xs text-gray-500">Chỉ chấp nhận file PDF (Tối đa 10MB)</p>
              </div>
              
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn file
              </button>
            </div>
            
            {uploadingFiles && (
              <div className="mt-3 flex items-center text-sm text-primary-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải lên tài liệu...
              </div>
            )}
            
            {formData.materials.length > 0 ? (
              <ul className="space-y-2 mt-3">
                {formData.materials.map((material, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="truncate mr-2">{material.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(material.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => removeMaterial(index)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm mt-3">Chưa có tài liệu nào được thêm</p>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <Link 
            href={`/admin/couserscontrol/${courseId}`} 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 font-medium shadow-sm hover:shadow transition"
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
                Đang tạo bài học...
              </>
            ) : (
              'Tạo bài học'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 