"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { ArrowLeft, Upload, X, Save, Loader2 } from 'lucide-react';
import { CategoryItem } from '@/app/types';
import Image from 'next/image';

// Define the CourseData interface for the form
interface CourseData {
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  duration: string;
  category: string;
  teacherId: string;
  isPublished: boolean;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    price: 0,
    thumbnail: '',
    duration: '',
    category: '',
    teacherId: '',
    isPublished: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  // Fetch course data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course data
        const data = await courseService.getCourseById(courseId);
        
        // Fetch categories
        const categoriesData = await courseService.getCategories();
        
        // Setup mock teachers for now
        const teachersData = [
          { _id: 'teacher1', firstName: 'Google', lastName: 'Career Certificates' },
          { _id: 'teacher2', firstName: 'Alice', lastName: 'Johnson' },
          { _id: 'teacher3', firstName: 'Bob', lastName: 'Smith' },
        ];
        
        // Set categories and teachers
        setCategories(categoriesData);
        setAvailableTeachers(teachersData);
        
        // Process teacher ID
        const teacherId = typeof data.teacherId === 'object' 
          ? data.teacherId._id 
          : data.teacherId;
        
        // Set course data in the form
        setCourseData({
          title: data.title || '',
          description: data.description || '',
          price: data.price || 0,
          thumbnail: data.thumbnail || '',
          duration: data.duration || '',
          category: data.category?._id || '',
          teacherId: teacherId || '',
          isPublished: data.isPublished || false,
        });
        
        // Set thumbnail preview
        if (data.thumbnail) {
          setThumbnailPreview(data.thumbnail);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setCourseData({
        ...courseData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === 'price') {
      setCourseData({
        ...courseData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setCourseData({
        ...courseData,
        [name]: value,
      });
    }
  };
  
  // Handle thumbnail file change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      // Update course data with the file name (in a real app, this would be the URL after upload)
      setCourseData({
        ...courseData,
        thumbnail: previewUrl,
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Validation
      if (!courseData.title.trim()) {
        throw new Error('Tên khóa học không được để trống');
      }
      
      if (!courseData.description.trim()) {
        throw new Error('Mô tả khóa học không được để trống');
      }
      
      if (!courseData.teacherId) {
        throw new Error('Vui lòng chọn giảng viên');
      }
      
      // In a real app, upload the thumbnail file if it exists
      // let thumbnailUrl = courseData.thumbnail;
      // if (thumbnailFile) {
      //   const uploadResult = await uploadService.uploadImage(thumbnailFile);
      //   thumbnailUrl = uploadResult.url;
      // }
      
      // Prepare the updated course data
      const updatedCourse = {
        ...courseData,
        // thumbnail: thumbnailUrl,
      };
      
      // Update the course
      await courseService.updateCourse(courseId, updatedCourse);
      
      // Show success message
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}`);
      }, 2000);
    } catch (error: any) {
      console.error("Error updating course:", error);
      setError(error.message || "Không thể cập nhật khóa học. Vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(item => (
              <div key={item} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href={`/admin/couserscontrol/${courseId}`}
            className="text-gray-500 hover:text-gray-700 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Chỉnh sửa khóa học</h1>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">Cập nhật khóa học thành công!</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="teacherId">
              Giảng viên <span className="text-red-500">*</span>
            </label>
            <select
              id="teacherId"
              name="teacherId"
              value={courseData.teacherId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
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
              Mô tả khóa học <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
                Giá khóa học (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={courseData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={courseData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="duration">
                Thời lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={courseData.duration}
                onChange={handleInputChange}
                placeholder="Ví dụ: 4 giờ 30 phút"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Trạng thái
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={courseData.isPublished}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                />
                <label htmlFor="isPublished" className="text-gray-700">
                  Công khai khóa học
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Ảnh thumbnail <span className="text-red-500">*</span>
            </label>
            
            <div className="border border-gray-300 border-dashed rounded-lg p-4">
              {thumbnailPreview ? (
                <div className="relative">
                  <div className="relative h-60 w-full mb-4">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      fill
                      unoptimized
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview('');
                      setThumbnailFile(null);
                      setCourseData({
                        ...courseData,
                        thumbnail: '',
                      });
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="text-gray-600">Kéo thả hoặc nhấp để tải lên</p>
                    <p className="text-gray-500 text-sm">PNG, JPG hoặc JPEG (tối đa 5MB)</p>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
                className={thumbnailPreview ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
              />
              
              <div className="mt-4 flex justify-center">
                <label
                  htmlFor="thumbnail"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {thumbnailPreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link
              href={`/admin/couserscontrol/${courseId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 