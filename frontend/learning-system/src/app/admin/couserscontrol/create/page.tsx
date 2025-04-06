"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { ArrowLeft, Upload, X, CheckCircle, Save } from 'lucide-react';
import { CategoryItem } from '@/app/types';
import Image from 'next/image';

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
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
    teacherId: '',
  });
  
  // Preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesData = await courseService.getCategories();
        setCategories(categoriesData);
        
        // In a real app, you would fetch teachers from a service
        // For now, we'll use mock data
        setAvailableTeachers([
          { _id: 'teacher1', firstName: 'Google', lastName: 'Career Certificates' },
          { _id: 'teacher2', firstName: 'Alice', lastName: 'Johnson' },
          { _id: 'teacher3', firstName: 'Bob', lastName: 'Smith' },
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    };
    
    fetchData();
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
      // In a real application, upload to server and get URL
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

  const validateForm = () => {
    // Basic validation
    if (!formData.title.trim()) {
      throw new Error('Tên khóa học không được để trống');
    }
    
    if (!formData.description.trim()) {
      throw new Error('Mô tả khóa học không được để trống');
    }
    
    if (!formData.teacherId) {
      throw new Error('Vui lòng chọn giảng viên');
    }
  };
  
  const prepareCourseData = () => {
    return {
      ...formData,
      lessons: [],
      quizzes: [],
      studentsEnrolled: [],
      reviews: [],
      categories: formData.category ? [formData.category] : [],
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Save course without redirecting
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      validateForm();
      
      // Prepare course data
      const courseData = prepareCourseData();
      
      // In a real app, call API to create/save course draft
      // const savedCourse = await courseService.saveCourseAsDraft(courseData);
      
      // Mock save
      console.log('Saving course data:', courseData);
      
      setSuccess('Khóa học đã được lưu!');
      
      // Set a timeout to clear the success message
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error: unknown) {
      console.error('Failed to save course:', error);
      setError(error instanceof Error ? error.message : 'Không thể lưu khóa học. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      validateForm();
      
      // Prepare course data
      const courseData = prepareCourseData();
      
      // In a real app, call API to create course
      // const newCourse = await courseService.createCourse(courseData);
      
      // Mock creation
      const newCourse = { _id: 'new-' + Date.now().toString(), ...courseData };
      
      setSuccess('Khóa học đã được tạo thành công!');
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${newCourse._id}`);
      }, 1500);
      
    } catch (error: unknown) {
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
          href="/admin/couserscontrol" 
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Tạo khóa học mới</h1>
      </div>
      
      {/* Alert messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <span className="mr-2 mt-0.5">⚠️</span>
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
            <label className="block text-gray-700 font-medium mb-2" htmlFor="teacherId">
              Giảng viên <span className="text-red-500">*</span>
            </label>
            <select
              id="teacherId"
              name="teacherId"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={formData.teacherId}
              onChange={handleChange}
            >
              <option value="">-- Chọn giảng viên --</option>
              {availableTeachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
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
                <div className="relative h-48 flex flex-col items-center justify-center cursor-pointer">
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
            href="/admin/couserscontrol" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
          >
            Hủy
          </Link>
          <button 
            type="button" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center mr-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
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