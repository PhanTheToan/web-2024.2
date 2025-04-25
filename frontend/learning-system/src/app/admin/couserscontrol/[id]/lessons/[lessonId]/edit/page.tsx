"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, X, File } from 'lucide-react';
import { Course, LessonMaterial } from '@/app/types';
import { toast } from 'react-hot-toast';
import dotenv from 'dotenv';
dotenv.config();
// Define API base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortTile: '',
    content: '',
    videoUrl: '',
    materials: [] as LessonMaterial[],
    orderLesson: 0,
    timeLimit: 0,
    status: 'INACTIVE',
  });

  // Additional state for file upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  // Check authentication and admin role
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
          credentials: 'include',
          method: 'GET'
        });
        
        if (!response.ok) {
          throw new Error('Authentication failed');
        }
        
        const data = await response.json();
        if (data.role !== 'ADMIN') {
          toast.error('You do not have permission to access this page');
          // router.push('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Authentication failed');
        // router.push('/login');
      }
    }
    
    checkAuth();
  }, [router]);
  
  // Fetch course and lesson data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch course info
        const courseRes = await fetch(`${API_BASE_URL}/course/info/${courseId}`, {
          credentials: 'include'
        });
        
        if (!courseRes.ok) {
          throw new Error('Failed to fetch course information');
        }
        
        const courseData = await courseRes.json();
        setCourse(courseData as Course);
        
        // Fetch lesson data
        const lessonRes = await fetch(`${API_BASE_URL}/course/get-lesson/${lessonId}`, {
          credentials: 'include'
        });
        
        if (!lessonRes.ok) {
          throw new Error('Failed to fetch lesson data');
        }
        
        const lessonData = await lessonRes.json();
        console.log("Lesson data:", lessonData);
        
        // Set form data with lesson information
        setFormData({
          title: lessonData.title || '',
          shortTile: lessonData.shortTile || '',
          content: lessonData.content || '',
          videoUrl: lessonData.videoUrl || '',
          materials: lessonData.materials ? lessonData.materials.map((path: string) => {
            const fileName = path.split('/').pop() || 'file';
            return {
              name: fileName,
              path: path,
              size: 'Unknown' // Size information not available
            };
          }) : [],
          orderLesson: lessonData.order || 0,
          timeLimit: lessonData.timeLimit || 0,
          status: lessonData.status || 'INACTIVE',
        });
        
        // Set video preview if URL exists
        if (lessonData.videoUrl) {
          setupVideoPreview(lessonData.videoUrl);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load lesson data. Please try again.');
        toast.error('Failed to load lesson data');
      } finally {
        setLoading(false);
      }
    }
    
    if (courseId && lessonId) {
      fetchData();
    }
  }, [courseId, lessonId, router]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orderLesson' || name === 'timeLimit' ? Number(value) : value
    }));
  };
  
  // Video preview setup
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, videoUrl: value }));
    setupVideoPreview(value);
  };
  
  const setupVideoPreview = (url: string) => {
    if (!url) {
      setVideoPreview(null);
      return;
    }
    
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      
      if (videoId) {
        setVideoPreview(`https://www.youtube.com/embed/${videoId}`);
      } else {
        setVideoPreview(null);
      }
    } 
    // Handle Vimeo URLs
    else if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (vimeoId) {
        setVideoPreview(`https://player.vimeo.com/video/${vimeoId}`);
      } else {
        setVideoPreview(null);
      }
    } else {
      setVideoPreview(null);
    }
  };
  
  // File upload handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingFile(true);
    setError(null);
    
    try {
      // Sử dụng API upload PDF giống như teacher
      const formDataToUpload = new FormData();
      
      // Thêm tất cả các file vào formData với key 'files'
      Array.from(files).forEach(file => {
        formDataToUpload.append('files', file);
      });
      
      console.log("Uploading files with formData key 'files'");
      
      const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToUpload
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải lên tài liệu');
      }
      
      // Parse response to get file URLs
      const data = await response.json();
      console.log('PDF upload response:', data);
      
      // Process URLs based on API response format
      let fileUrls: string[] = [];
      if (Array.isArray(data)) {
        // If response is an array of URLs
        fileUrls = data;
      } else if (data && data.body && Array.isArray(data.body.urls)) {
        // If response has a body.urls array
        fileUrls = data.body.urls;
      } else {
        throw new Error('Không nhận được URL tài liệu từ API');
      }
      
      // Create new material objects
      const newMaterials = fileUrls.map((url, index) => {
        const fileName = url.split('/').pop() || `File ${index + 1}`;
        return {
          name: fileName,
          path: url,
          type: determineMaterialType(files[index].type),
          size: files[index].size
        };
      });
      
      // Update form data with new materials
      setFormData({
        ...formData,
        materials: [...formData.materials, ...newMaterials]
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Tải lên tài liệu thành công');
    } catch (error) {
      console.error('Upload error:', error);
      setError('Không thể tải lên tài liệu. Vui lòng thử lại sau.');
      toast.error('Không thể tải lên tài liệu. Vui lòng thử lại sau.');
    } finally {
      setUploadingFile(false);
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
      
      if (formData.timeLimit <= 0) {
        throw new Error('Thời gian học phải lớn hơn 0 phút');
      }
      
      // Extract just the paths for API call
      const materialPaths = formData.materials.map(m => m.path);
      
      // Prepare request data - match the format of teacher's API
      const requestData = {
        title: formData.title,
        shortTile: formData.shortTile || formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl,
        materials: materialPaths,
        order: formData.orderLesson,
        timeLimit: formData.timeLimit,
        status: formData.status
      };
      
      console.log("Updating lesson with data:", requestData);
      
      // Update lesson using the same API as teacher
      const response = await fetch(`${API_BASE_URL}/course/update-lesson/${lessonId}?courseId=${courseId}`, {
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
        throw new Error("Không thể cập nhật bài học");
      }
      
      const data = await response.json();
      console.log("Lesson updated successfully:", data);
      
      setSuccess('Bài học đã được cập nhật thành công!');
      toast.success('Bài học đã được cập nhật thành công!');
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}`);
      }, 1500);
      
    } catch (error: unknown) {
      console.error('Failed to update lesson:', error);
      if (error instanceof Error) {
        setError(error.message || 'Không thể cập nhật bài học. Vui lòng thử lại sau.');
        toast.error(error.message || 'Không thể cập nhật bài học. Vui lòng thử lại sau.');
      } else {
        setError('Không thể cập nhật bài học. Vui lòng thử lại sau.');
        toast.error('Không thể cập nhật bài học. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Add a helper function to determine the material type
  const determineMaterialType = (fileType: string): 'pdf' | 'doc' | 'image' | 'other' => {
    if (fileType.includes('pdf')) {
      return 'pdf';
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return 'doc';
    } else if (fileType.includes('image')) {
      return 'image';
    } else {
      return 'other';
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
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
          href={`/admin/couserscontrol/${courseId}/lessons/${lessonId}`} 
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa bài học</h1>
      </div>
      
      <p className="text-gray-500 mb-6">Khóa học: <span className="font-medium">{course.title}</span></p>
      
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
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
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
            <label className="block text-gray-700 font-medium mb-2" htmlFor="shortTile">
              Tiêu đề ngắn
            </label>
            <input
              id="shortTile"
              name="shortTile"
              type="text"
              placeholder="Nhập tiêu đề ngắn về bài học"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.shortTile}
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
              URL Video
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="Nhập URL video từ YouTube, Vimeo, ..."
              className="w-full px-3 py-2 border rounded-md"
              value={formData.videoUrl}
              onChange={handleVideoChange}
            />
            
            {videoPreview && (
              <div className="mt-3">
                <p className="text-gray-700 font-medium mb-2">Xem trước video:</p>
                <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                  <iframe
                    src={videoPreview}
                    title="Video Preview"
                    className="absolute w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="orderLesson">
              Thứ tự bài học
            </label>
            <div className="flex items-center">
              <span className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600">
                {formData.orderLesson}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                (Thứ tự được quản lý tự động trong phần sắp xếp nội dung khóa học)
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Để thay đổi thứ tự, vui lòng sử dụng chức năng &quot;Sắp xếp lại&quot; trong trang chi tiết khóa học
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="timeLimit">
              Thời gian hoàn thành (phút) <span className="text-red-500">*</span>
            </label>
            <input
              id="timeLimit"
              name="timeLimit"
              type="number"
              min="1"
              required
              placeholder="Nhập thời gian hoàn thành bài học (phút)"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.timeLimit}
              onChange={handleChange}
            />
            <p className="text-gray-500 text-sm mt-1">Thời gian ước tính để hoàn thành bài học</p>
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
                ? "Bài học đang được kích hoạt, học viên có thể truy cập." 
                : "Bài học hiện đang bị vô hiệu hóa, học viên không thể truy cập."}
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Tài liệu bài học (PDF)
            </label>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                className="hidden"
              />
              <div className="space-y-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <File className="w-12 h-12 text-gray-400 mx-auto" />
                <div className="text-gray-700 font-medium">
                  {uploadingFile ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span>Đang tải lên...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-primary-600">Nhấp để tải lên</span> hoặc kéo thả tài liệu
                    </>
                  )}
                </div>
                <p className="text-gray-500 text-sm">Chấp nhận PDF, Word, PowerPoint, Text</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              {formData.materials.map((material, index) => (
                <div key={index} className="flex items-center bg-gray-50 p-3 rounded-md">
                  <File className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium truncate">{material.name}</p>
                    <p className="text-xs text-gray-500">{typeof material.size === 'number' ? `${(material.size / 1024 / 1024).toFixed(2)} MB` : material.size}</p>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 ml-2"
                    onClick={() => removeMaterial(index)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {formData.materials.length === 0 && (
                <p className="text-gray-500 text-sm italic">Chưa có tài liệu nào được thêm</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <Link 
            href={`/admin/couserscontrol/${courseId}/lessons/${lessonId}`} 
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
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 