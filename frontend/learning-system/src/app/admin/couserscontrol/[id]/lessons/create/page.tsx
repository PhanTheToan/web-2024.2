"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, X, FileText } from 'lucide-react';
import { Course, LessonMaterial } from '@/app/types';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import dotenv from 'dotenv';
dotenv.config();
// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

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
    shortTitle: '',
    description: '',
    content: '',
    videoUrl: '',
    orderLesson: 0, // Sẽ được cập nhật từ API
    timeLimit: 30, // Mặc định 30 phút
    materials: [] as LessonMaterial[],
    status: 'INACTIVE',
  });

  // Additional state for file upload
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<{
    maxOrder: number;
    maxLessonOrder: number;
    maxQuizOrder: number;
    nextOrder: number;
  }>({ maxOrder: 0, maxLessonOrder: 0, maxQuizOrder: 0, nextOrder: 1 });
  
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
      const response = await fetch(`${API_BASE_URL}/course/info-course/${courseId}`, {
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
      
      // Fetch lessons to determine order
      fetchLessons(courseId);
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm để lấy danh sách bài học và xác định orderLesson tiếp theo
  const fetchLessons = async (courseId: string) => {
    try {
      // Gọi API để lấy giá trị maxOrder
      const response = await fetch(`${API_BASE_URL}/course/get-max-order?courseId=${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch max order");
      }

      const data = await response.json();
      console.log("Max order data:", data);
      
      // Lấy maxOrder từ API response
      let maxOrder = 0;
      if (data && data.maxOrder !== undefined) {
        maxOrder = data.maxOrder;
      } else if (data.body && data.body.maxOrder !== undefined) {
        maxOrder = data.body.maxOrder;
      }
      
      // Đặt orderLesson mới là maxOrder + 1
      const nextOrder = maxOrder + 1;
      
      // Update form data with the calculated order
      setFormData(prev => ({
        ...prev,
        orderLesson: nextOrder
      }));
      
      console.log("Max order value:", maxOrder, "Next order:", nextOrder);
      
      // Lưu thông tin để hiển thị UI
      setOrderInfo({
        maxOrder,
        maxLessonOrder: 0, // Không cần thiết khi dùng API trực tiếp
        maxQuizOrder: 0,   // Không cần thiết khi dùng API trực tiếp
        nextOrder
      });
    } catch (err) {
      console.error("Error fetching max order:", err);
      // Fallback: gọi API cũ nếu API mới không hoạt động
      try {
        const response = await fetch(`${API_BASE_URL}/course/lesson_quiz/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch lessons");
        }

        const data = await response.json();
        console.log("Lessons and quizzes data:", data);
        
        let maxOrder = 0;
        
        // Xử lý mảng lessons từ API
        const lessons = data.body?.lessons || [];
        if (Array.isArray(lessons)) {
          lessons.forEach(lesson => {
            const lessonOrder = lesson.order || lesson.orderLesson || 0;
            if (lessonOrder > maxOrder) {
              maxOrder = lessonOrder;
            }
          });
        }
        
        // Xử lý mảng quizzes từ API
        const quizzes = data.body?.quizzes || [];
        if (Array.isArray(quizzes)) {
          quizzes.forEach(quiz => {
            const quizOrder = quiz.order || quiz.orderQuiz || 0;
            if (quizOrder > maxOrder) {
              maxOrder = quizOrder;
            }
          });
        }
        
        // Đặt orderLesson mới là maxOrder + 1
        const nextOrder = maxOrder + 1;
        
        setFormData(prev => ({
          ...prev,
          orderLesson: nextOrder
        }));
        
        setOrderInfo({
          maxOrder,
          maxLessonOrder: 0,
          maxQuizOrder: 0,
          nextOrder
        });
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ['orderLesson', 'timeLimit'].includes(name) ? parseInt(value) || 0 : value,
    });
  };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      videoUrl: value,
    });
    
    // For preview purposes
    setVideoPreview(value);
  };

  // Hàm upload file tài liệu
  const uploadFile = async (files: File[]): Promise<string[]> => {
    try {
      const formData = new FormData();
      
      // Thêm nhiều file vào formData
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Lỗi tải lên tài liệu: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("File upload response:", data);
      
      // Dựa vào API response format
      if (data && Array.isArray(data)) {
        return data.filter(url => typeof url === 'string');
      }
      
      // Trường hợp khác
      if (data && data.body && Array.isArray(data.body.urls)) {
        return data.body.urls;
      }
      
      console.error("Response structure:", JSON.stringify(data));
      throw new Error("Không nhận dạng được URL tệp sau khi tải lên");
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setFileError(null);
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    
    // Kiểm tra từng file
    for (const file of files) {
      // Check file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFileError(`File "${file.name}": Chỉ chấp nhận định dạng PDF, DOCX, JPEG và PNG.`);
        continue;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`File "${file.name}": Kích thước tập tin vượt quá giới hạn 5MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
      return;
    }

    try {
      setUploadingFiles(true);
      // Upload nhiều file và lấy mảng URL
      const fileUrls = await uploadFile(validFiles);
      
      // Tạo các object material mới với URL thực
      const newMaterials = validFiles.map((file, index) => {
        // Xác định loại file
        const fileType = file.type.includes('pdf') ? 'pdf' : 
                       file.type.includes('word') ? 'doc' : 'image';
        
        return {
          name: file.name,
          type: fileType as 'pdf' | 'doc' | 'image' | 'other',
          path: fileUrls[index] || '',
          size: file.size
        };
      }).filter(material => material.path !== ''); // Loại bỏ các material không có path

      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, ...newMaterials]
      }));
      
      if (newMaterials.length === 1) {
        toast.success(`Tài liệu "${newMaterials[0].name}" đã được tải lên thành công`);
      } else {
        toast.success(`${newMaterials.length} tài liệu đã được tải lên thành công`);
      }
    } catch (error) {
      console.error("Upload file error:", error);
      setFileError("Lỗi khi tải tập tin lên máy chủ. Vui lòng thử lại.");
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      
      // Prepare lesson data according to the API format - updated to match teacher implementation
      const lessonData = {
        title: formData.title.toString(),
        shortTile: formData.shortTitle.toString() || formData.title.toString(),
        content: formData.content.toString(),
        order: formData.orderLesson, // Send as number like teacher implementation
        timeLimit: formData.timeLimit, // Send as number like teacher implementation
        videoUrl: formData.videoUrl.toString(),
        materials: formData.materials.map(m => m.path), // Send as array like teacher implementation
        status: formData.status // Thêm trạng thái
      };
      console.log('courseId:', courseId);
      console.log('title:', formData.title);
      console.log('shortTile:', formData.shortTitle || formData.title);
      console.log('content:', formData.content);
      console.log('order:', formData.orderLesson);
      console.log('timeLimit:', formData.timeLimit);
      console.log('videoUrl:', formData.videoUrl);
      console.log('materials:', formData.materials.map(m => m.path));

      console.log('Submitting lesson data:', lessonData);
      
      // Call the API to create lesson - updated to match teacher implementation
      const response = await fetch(`${API_BASE_URL}/course/create-lesson?courseId=${courseId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể tạo bài học');
      }
      
      const responseData = await response.json();
      console.log('Lesson created successfully:', responseData);
      
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
            <label className="block text-gray-700 font-medium mb-2" htmlFor="orderLesson">
              Thứ tự bài học
            </label>
            <input
              id="orderLesson"
              name="orderLesson"
              type="number"
              min="1"
              className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              value={formData.orderLesson || orderInfo.nextOrder || 1}
              readOnly
            />
            {orderInfo.maxOrder > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Thứ tự tự động: {orderInfo.nextOrder} (tiếp theo của bài học/quiz cuối cùng)
              </p>
            )}
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
            <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
              Trạng thái bài học <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Hoạt động (học viên có thể truy cập)</option>
              <option value="INACTIVE">Không hoạt động (học viên không thể truy cập)</option>
            </select>
            <p className="text-gray-500 text-sm mt-1">
              {formData.status === 'ACTIVE' 
                ? "Bài học sẽ được kích hoạt, học viên có thể truy cập ngay lập tức." 
                : "Bài học sẽ bị vô hiệu hóa, học viên không thể truy cập cho đến khi được kích hoạt."}
            </p>
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
            
            {fileError && (
              <div className="text-red-500 text-sm mt-3">
                {fileError}
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
                        {material.size ? `${Math.round(material.size / 1024)} KB` : 'Unknown size'}
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