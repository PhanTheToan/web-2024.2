"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { CategoryItem } from '@/app/types';
import Image from 'next/image';

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
    duration: '',
    category: '',
    thumbnail: '',
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Trong thực tế, cần upload lên server và lấy URL
      // Hiện tại giả lập bằng URL.createObjectURL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData({
        ...formData,
        thumbnail: imageUrl, // Trong thực tế sẽ là URL từ server
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
      // Mock user ID cho giáo viên - trong ứng dụng thực sẽ lấy từ authentication
      const teacherId = 'teacher1';
      
      // Chuẩn bị dữ liệu khóa học
      const courseData = {
        ...formData,
        teacherId,
        lessons: [],
        quizzes: [],
        studentsEnrolled: [],
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Giả lập tạo khóa học
      // Lưu ý: Trong ứng dụng thực tế cần gọi API tạo khóa học
      const newCourse = { _id: 'new-' + Date.now().toString(), ...courseData };
      
      setSuccess('Khóa học đã được tạo thành công!');
      
      // Chuyển hướng đến trang chi tiết khóa học sau 1 giây
      setTimeout(() => {
        router.push(`/teacher/courses/${newCourse._id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to create course:', error);
      setError('Không thể tạo khóa học. Vui lòng thử lại sau.');
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
              <label className="block text-gray-700 font-medium mb-2" htmlFor="duration">
                Thời lượng
              </label>
              <input
                id="duration"
                name="duration"
                type="text"
                placeholder="Ví dụ: 2 giờ 30 phút"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
              Danh mục
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Ảnh thu nhỏ
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              {previewImage ? (
                <div className="relative">
                  <Image 
                    src={previewImage} 
                    alt="Preview" 
                    width={300}
                    height={192}
                    unoptimized
                    className="mx-auto h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={clearPreviewImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Nhấp để tải lên hoặc kéo và thả ảnh
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <Link 
            href="/teacher/courses" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
          >
            Hủy
          </Link>
          <button 
            type="submit" 
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Tạo khóa học'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-gray-500 text-sm">
        <p>Sau khi tạo khóa học, bạn có thể thêm bài học và bài kiểm tra.</p>
      </div>
    </div>
  );
} 