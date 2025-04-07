"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { lessonService } from '@/services/lessonService';
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, X, File, FileText } from 'lucide-react';
import { Course } from '@/app/types';
import { toast } from 'react-hot-toast';

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
    description: '',
    content: '',
    videoUrl: '',
    order: 0,
    timeLimit: 0,
    materials: [] as {name: string, path: string, size: string}[],
  });

  // Additional state for file upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course data
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData as Course);
        
        // Fetch lesson data
        const lessonData = await lessonService.getLessonById(lessonId);
        
        // Convert string materials to file objects
        const materialFiles = Array.isArray(lessonData.materials) 
          ? lessonData.materials.map(path => {
              const fileName = path.split('/').pop() || 'unknown';
              return {
                name: fileName,
                path: path,
                size: 'Unknown' // Size cannot be determined for existing files
              };
            })
          : [];
        
        // Populate form
        setFormData({
          title: lessonData.title,
          description: lessonData.description || '',
          content: lessonData.content,
          videoUrl: lessonData.videoUrl || '',
          order: lessonData.order || 0,
          timeLimit: lessonData.timeLimit || 0,
          materials: materialFiles,
        });
        
        // Set video preview if available
        if (lessonData.videoUrl) {
          setVideoPreview(lessonData.videoUrl);
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value) || 0 : name === 'timeLimit' ? parseInt(value) || 0 : value,
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
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingFile(true);
    
    const files = Array.from(e.target.files);
    
    // Simulate file upload
    setTimeout(() => {
      // Handle PDF files only
      const pdfFiles = files.filter(file => 
        file.type === 'application/pdf'
      );
      
      if (pdfFiles.length === 0) {
        setError('Chỉ hỗ trợ tải lên file PDF');
        setUploadingFile(false);
        return;
      }
      
      // Process the files (in real app would upload to server/storage)
      const newMaterials = pdfFiles.map(file => {
        // Create a fake URL for demonstration
        const fakePath = `/uploads/materials/${Date.now()}_${file.name}`;
        return {
          name: file.name,
          path: fakePath,
          size: formatFileSize(file.size)
        };
      });
      
      // Update form data with new materials
      setFormData({
        ...formData,
        materials: [...formData.materials, ...newMaterials]
      });
      
      setUploadingFile(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1000); // Simulated upload delay
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
        throw new Error('Thời gian hoàn thành phải lớn hơn 0 phút');
      }
      
      // Extract just the paths for API call
      const materialPaths = formData.materials.map(m => m.path);
      
      // Update lesson data
      await lessonService.updateLesson(lessonId, {
        ...formData,
        materials: materialPaths
      });
      
      setSuccess('Bài học đã được cập nhật thành công!');
      toast.success('Bài học đã được cập nhật thành công!');
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}/lessons/${lessonId}`);
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
            <label className="block text-gray-700 font-medium mb-2" htmlFor="order">
              Thứ tự bài học
            </label>
            <input
              id="order"
              name="order"
              type="number"
              min="1"
              placeholder="Nhập thứ tự bài học"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.order}
              onChange={handleChange}
            />
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
            <label className="block text-gray-700 font-medium mb-2">
              Tài liệu bổ sung (PDF)
            </label>
            
            <div className="flex mb-4">
              <div className="relative flex-grow">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border border-dashed border-gray-300 rounded-md px-4 py-6 flex flex-col items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">Kéo thả file PDF hoặc click để chọn</p>
                  <p className="text-xs text-gray-400">Chỉ hỗ trợ file PDF</p>
                </div>
              </div>
            </div>
            
            {uploadingFile && (
              <div className="flex items-center text-blue-600 my-2">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Đang tải lên...</span>
              </div>
            )}
            
            <div className="space-y-2">
              {formData.materials.map((material, index) => (
                <div key={index} className="flex items-center bg-gray-50 p-3 rounded-md">
                  <File className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium truncate">{material.name}</p>
                    <p className="text-xs text-gray-500">{material.size}</p>
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