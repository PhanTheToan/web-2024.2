"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { CategoryItem } from '@/app/types';

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    categories: [] as string[],
    thumbnail: '',
    isPublished: false,
    registrations: 0, // This will be managed by the system
    totalDuration: 0, // Total duration in minutes, calculated from lessons and quizzes timeLimit
  });
  
  // Preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await courseService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value,
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData({
        ...formData,
        thumbnail: imageUrl,
      });
    }
  };
  
  const clearPreviewImage = () => {
    setPreviewImage(null);
    setFormData({
      ...formData,
      thumbnail: '',
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate categories
      if (formData.categories.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một danh mục cho khóa học');
      }
      
      // Get current user ID from authentication context
      const teacherId = 'current_user_id'; // This should come from auth context
      
      const courseData = {
        ...formData,
        teacherId,
        lessons: [],
        quizzes: [],
        studentsEnrolled: [],
        reviews: [],
        registrations: 0,
        totalDuration: 0, // Will be calculated as lessons and quizzes with timeLimit are added
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _id: 'new-' + Date.now().toString(), // Temporary ID for mock data
      };
      
      // Add to mock courses
      // In real implementation, this would be an API call
      const newCourse = courseData;
      
      setSuccess('Khóa học đã được tạo thành công!');
      
      // Redirect to course detail page after 1 second
      setTimeout(() => {
        router.push(`/teacher/courses/${newCourse._id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to create course:', error);
      setError(error instanceof Error ? error.message : 'Không thể tạo khóa học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link 
          href="/teacher/courses" 
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Tạo khóa học mới</h1>
      </div>
      
      {/* Alert messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Nhập tên khóa học"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              placeholder="Mô tả chi tiết về khóa học"
              className="w-full px-3 py-2 border rounded-md h-32"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
                Giá (USD) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="Giá khóa học"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="categories">
                Danh mục <span className="text-red-500">*</span>
              </label>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Chọn danh mục cho khóa học</h4>
                    <span className="text-sm text-gray-500">Đã chọn: {formData.categories.length}</span>
                  </div>
                </div>
                
                <div className="p-4 max-h-72 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Không có danh mục nào</p>
                  ) : (
                    <div className="space-y-3">
                      {categories.map(cat => {
                        const isSelected = formData.categories.includes(cat.name);
                        return (
                          <div 
                            key={cat.name} 
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                              ${isSelected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                            onClick={() => {
                              const updatedCategories = isSelected 
                                ? formData.categories.filter(c => c !== cat.name)
                                : [...formData.categories, cat.name];
                                
                              setFormData({
                                ...formData,
                                categories: updatedCategories
                              });
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Controlled by the div onClick
                              className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="ml-3 flex-1">
                              <span className="text-gray-800 font-medium">{cat.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {formData.categories.length > 0 && (
                  <div className="p-4 border-t bg-white">
                    <div className="text-sm font-medium text-gray-700 mb-2">Danh mục đã chọn:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map(categoryName => (
                        <div 
                          key={categoryName}
                          className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm"
                        >
                          {categoryName}
                          <button
                            type="button"
                            className="ml-1.5 text-indigo-500 hover:text-indigo-700"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                categories: formData.categories.filter(c => c !== categoryName)
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {formData.categories.length === 0 && (
                <div className="mt-1 text-sm text-gray-500">
                  Vui lòng chọn ít nhất một danh mục cho khóa học
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="totalDuration">
              Tổng thời gian (phút)
            </label>
            <input
              id="totalDuration"
              name="totalDuration"
              type="number"
              value="0"
              className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Sẽ được tự động tính từ thời gian của các bài học và bài kiểm tra</p>
          </div>

          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Đang hoạt động</span>
            </label>
            <p className="text-sm text-gray-500 ml-6">Nếu được chọn, khóa học sẽ được hiển thị cho học viên</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Ảnh thu nhỏ
            </label>
            <div className="mt-2">
              {previewImage ? (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-xs rounded"
                  />
                  <button
                    type="button"
                    onClick={clearPreviewImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
                    <Upload className="w-8 h-8" />
                    <span className="mt-2 text-base leading-normal">Chọn ảnh</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Đang tạo...' : 'Tạo khóa học'}
          </button>
        </div>
      </form>
    </div>
  );
} 