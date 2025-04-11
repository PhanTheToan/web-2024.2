"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, CheckCircle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

// Định nghĩa interface cho Category
interface Category {
  categoryId: string;
  categoryName: string;
  categoryDisplayName: string;
}

// Định nghĩa interface cho Teacher
interface Teacher {
  _id: string;
  userId?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
}

// Định nghĩa interface cho API response formats
interface UserData {
  _id?: string;
  userId?: string;
  id?: string;
  UserId?: string;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  email?: string;
  Email?: string;
  role?: string;
  Role?: string;
  [key: string]: unknown;
}

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    categories: [] as string[],
    thumbnail: '',
    teacherId: '',
    status: 'INACTIVE'
  });
  
  // Preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Lấy thông tin người dùng hiện tại và kiểm tra quyền admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
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
          router.push('/login?redirect=/admin/couserscontrol/create');
          return;
        }
        
        console.log("Authenticated user:", userData);
        
        // Fetch teachers and categories after authentication
        fetchTeachers();
        fetchCategories();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        router.push('/login?redirect=/admin/couserscontrol/create');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Lấy danh sách giáo viên
  const fetchTeachers = async () => {
    try {
      console.log("Fetching teachers...");
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách giáo viên');
      }
      
      const data = await response.json();
      console.log("Users data:", data);
      
      // Lọc lấy những user có role là ROLE_TEACHER
      let teachers: Teacher[] = [];
      
      // Xử lý trường hợp dữ liệu nằm trong body
      if (data.body && Array.isArray(data.body)) {
        const teacherUsers = data.body.filter((user: UserData) => 
          user.role === 'ROLE_TEACHER' || user.Role === 'ROLE_TEACHER'
        );
        
        teachers = teacherUsers.map((user: UserData, index: number) => {
          // Lấy đúng ID từ dữ liệu API - ưu tiên field UserId
          const teacherId = (user.UserId || user.userId || user._id || user.id || `teacher-${index}`) as string;
          console.log(`Teacher ${index} extracted ID:`, teacherId);
          
          return {
            _id: teacherId,
            userId: teacherId,
            firstName: user.firstName || user.FirstName || '',
            lastName: user.lastName || user.LastName || '',
            email: user.email || user.Email || '',
            role: user.role || user.Role || ''
          };
        });
              console.log("Teachers data:", teachers);

      } 
      // Xử lý trường hợp dữ liệu là một mảng trực tiếp
      else if (Array.isArray(data)) {
        const teacherUsers = data.filter((user: UserData) => 
          user.role === 'ROLE_TEACHER' || user.Role === 'ROLE_TEACHER'
        );
        
        teachers = teacherUsers.map((user: UserData, index: number) => {
          // Lấy đúng ID từ dữ liệu API - ưu tiên field UserId
          const teacherId = (user.UserId || user.userId || user._id || user.id || `teacher-${index}`) as string;
          console.log(`Teacher ${index} extracted ID:`, teacherId);
          
          return {
            _id: teacherId,
            userId: teacherId,
            firstName: user.firstName || user.FirstName || '',
            lastName: user.lastName || user.LastName || '',
            email: user.email || user.Email || '',
            role: user.role || user.Role || ''
          };
        });
      }
      
      // Đảm bảo không có key trùng lặp và in ra ID để debug
      const uniqueTeachers = teachers.reduce((acc: Teacher[], current) => {
        console.log("Processing teacher:", current);
        const x = acc.find(item => item._id === current._id);
        if (!x) {
          return acc.concat([current]);
        } else {
          // Nếu có trùng lặp, tạo một key mới bằng cách thêm suffix
          current._id = `${current._id}-${Math.random().toString(36).substring(2, 9)}`;
          return acc.concat([current]);
        }
      }, []);
      
      console.log("Teachers data (unique):", uniqueTeachers);
      setAvailableTeachers(uniqueTeachers);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      setError('Không thể tải danh sách giáo viên. Vui lòng thử lại sau.');
    }
  };
  
  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const response = await fetch(`${API_BASE_URL}/categories/featured-category`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải danh mục');
      }
      
      const data = await response.json();
      console.log("Categories data:", data);
      
      // Hàm để kiểm tra xem một object có phải là Category không
      const isCategory = (item: unknown): item is Category => {
        return item !== null && 
               typeof item === 'object' && 
               'categoryId' in (item as Record<string, unknown>) && 
               typeof (item as Record<string, unknown>).categoryId === 'string';
      };
      
      // Kiểm tra cấu trúc dữ liệu API trả về và xử lý phù hợp
      if (Array.isArray(data)) {
        // Lọc để đảm bảo chỉ có đối tượng Category hợp lệ
        const validCategories = data.filter(isCategory);
        setCategories(validCategories);
      } else if (data && typeof data === 'object' && 'body' in data && Array.isArray(data.body)) {
        const validCategories = data.body.filter(isCategory);
        setCategories(validCategories);
      } else if (data && typeof data === 'object') {
        // Nếu data là object, kiểm tra xem có phải mảng các danh mục không
        console.log("Data structure:", Object.keys(data));
        const categoryArray = Object.values(data);
        if (categoryArray.length > 0) {
          const validCategories = categoryArray.filter(isCategory);
          setCategories(validCategories);
        } else {
          console.error("Unexpected data structure:", data);
          setCategories([]);
        }
      } else {
        console.error("Invalid categories data format:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      setCategories([]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };
  
  const clearPreviewImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setFormData({
      ...formData,
      thumbnail: '',
    });
  };
  
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      console.log("Uploading image...");
      const response = await fetch(`${API_BASE_URL}/upload/image/r2`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải lên hình ảnh');
      }
      
      // Xử lý khi API trả về trực tiếp URL dạng text
      const imageUrl = await response.text();
      console.log("Upload result (URL):", imageUrl);
      
      if (!imageUrl || imageUrl.trim() === '') {
        throw new Error('Không nhận được URL hình ảnh');
      }
      
      return imageUrl.trim();
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Không thể tải lên hình ảnh. Vui lòng thử lại sau.');
    }
  };
  
  // Save course without redirecting - sử dụng draft mode
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Vui lòng nhập tên khóa học');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Vui lòng nhập mô tả khóa học');
      }
      
      if (!formData.teacherId) {
        throw new Error('Vui lòng chọn giảng viên');
      }
      
      if (formData.categories.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một danh mục cho khóa học');
      }
      
      // Upload image if selected
      let thumbnailUrl = formData.thumbnail;
      if (selectedFile) {
        thumbnailUrl = await uploadImage(selectedFile);
      }
      
      // Prepare course data with DRAFT status
      const courseData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        categories: formData.categories,
        thumbnail: thumbnailUrl,
        status: 'DRAFT', // Save as draft
        teacherId: formData.teacherId
      };
      
      console.log("Saving course data as draft:", courseData);
      
      // Call the create course API for admin
      const response = await fetch(`${API_BASE_URL}/course/admin/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo khóa học');
      }
      
      const result = await response.json();
      console.log("Course saved as draft:", result);
      
      setSuccess('Khóa học đã được lưu dưới dạng bản nháp!');
      toast.success('Khóa học đã được lưu dưới dạng bản nháp!');
      
    } catch (error) {
      console.error('Failed to save course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu khóa học. Vui lòng thử lại sau.';
      setError(errorMessage);
      toast.error(errorMessage);
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
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Vui lòng nhập tên khóa học');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Vui lòng nhập mô tả khóa học');
      }
      
      if (!formData.teacherId) {
        throw new Error('Vui lòng chọn giảng viên');
      }
      
      if (formData.categories.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một danh mục cho khóa học');
      }
      
      // Upload image if selected
      let thumbnailUrl = formData.thumbnail;
      if (selectedFile) {
        thumbnailUrl = await uploadImage(selectedFile);
      }
      
      // Prepare course data
      const courseData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        categories: formData.categories,
        thumbnail: thumbnailUrl,
        status: formData.status,
        teacherId: formData.teacherId
      };
      
      console.log("Creating course with data:", courseData);
      
      // Submit course data to admin API endpoint
      const response = await fetch(`${API_BASE_URL}/course/admin/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo khóa học');
      }
      
      const result = await response.json();
      console.log("Course created:", result);
      
      setSuccess('Khóa học đã được tạo thành công!');
      toast.success('Khóa học đã được tạo thành công!');
      
      // Redirect to course detail page after 1 second
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${result._id || result.courseId || result.id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to create course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo khóa học. Vui lòng thử lại sau.';
      setError(errorMessage);
      toast.error(errorMessage);
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
              {availableTeachers.length > 0 ? (
              
                availableTeachers.map((teacher, index) => (
                  <option key={`teacher-option-${teacher._id}-${index}`} value={teacher.userId || teacher._id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.email})
                  </option>
                ))
              ) : (
                <option value="" disabled>Không có giáo viên nào</option>
              )}
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
              <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="INACTIVE">Vô hiệu hóa</option>
                <option value="ACTIVE">Đang hoạt động</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
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
                {!Array.isArray(categories) || categories.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Không có danh mục nào</p>
                ) : (
                  <div className="space-y-3">
                    {categories.map(cat => {
                      // Thêm kiểm tra an toàn cho cat
                      if (!cat || !cat.categoryId) {
                        console.log("Invalid category object:", cat);
                        return null;
                      }
                      
                      const isSelected = formData.categories.includes(cat.categoryId);
                      return (
                        <div 
                          key={cat.categoryId} 
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                            ${isSelected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                          onClick={() => {
                            const updatedCategories = isSelected 
                              ? formData.categories.filter(c => c !== cat.categoryId)
                              : [...formData.categories, cat.categoryId];
                                
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
                            <span className="text-gray-800 font-medium">{cat.categoryDisplayName || cat.categoryName || "Danh mục"}</span>
                            {cat.categoryName && <span className="text-gray-500 text-sm ml-2">({cat.categoryName})</span>}
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
                    {formData.categories.map(categoryId => {
                      const category = categories.find(c => c.categoryId === categoryId);
                      return (
                        <div 
                          key={categoryId}
                          className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm"
                        >
                          {category?.categoryDisplayName || categoryId}
                          <button
                            type="button"
                            className="ml-1.5 text-indigo-500 hover:text-indigo-700"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                categories: formData.categories.filter(c => c !== categoryId)
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
              
            {formData.categories.length === 0 && (
              <div className="mt-1 text-sm text-red-500">
                Vui lòng chọn ít nhất một danh mục cho khóa học
              </div>
            )}
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
            {saving ? 'Đang lưu...' : 'Lưu bản nháp'}
          </button>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
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