"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, X, CheckCircle, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

// Định nghĩa interface cho Category
interface Category {
  categoryId: string;
  categoryName: string;
  categoryDisplayName: string;
  isSpecial?: boolean; // Mark for PRIVATE or PUBLIC categories
}

// Định nghĩa interface cho UserData
interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  profileImage: string | null;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    categories: [] as string[],
    specialCategory: '', // For PRIVATE or PUBLIC
    thumbnail: '',
    teacherId: '',
    status: 'INACTIVE'
  });
  
  // Preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Lấy thông tin người dùng hiện tại
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
        
        if (userData.role !== 'ROLE_TEACHER') {
          toast.error('Bạn không có quyền truy cập trang này');
          router.push('/login?redirect=/teacher/courses');
          return;
        }
        
        console.log("Authenticated user:", userData);
        setUserData(userData);
        setFormData(prev => ({
          ...prev,
          teacherId: userData._id || userData.id
        }));
        
        // Fetch categories after authentication
        fetchCategories();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        router.push('/login?redirect=/teacher/courses');
      }
    };
    
    checkAuth();
  }, [router]);
  
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
      let validCategories: Category[] = [];
      
      if (Array.isArray(data)) {
        // Lọc để đảm bảo chỉ có đối tượng Category hợp lệ
        validCategories = data.filter(isCategory);
      } else if (data && typeof data === 'object' && 'body' in data && Array.isArray(data.body)) {
        validCategories = data.body.filter(isCategory);
      } else if (data && typeof data === 'object') {
        // Nếu data là object, kiểm tra xem có phải mảng các danh mục không
        console.log("Data structure:", Object.keys(data));
        const categoryArray = Object.values(data);
        if (categoryArray.length > 0) {
          validCategories = categoryArray.filter(isCategory);
        } else {
          console.error("Unexpected data structure:", data);
        }
      } else {
        console.error("Invalid categories data format:", data);
      }
      
      // Mark special categories for private/public
      validCategories = validCategories.map(cat => ({
        ...cat,
        isSpecial: cat.categoryName === 'PRIVATE' || cat.categoryName === 'PUBLIC'
      }));
      
      setCategories(validCategories);
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
      
      // Combined categories include regular and special categories
      const allCategories = formData.specialCategory 
        ? [...formData.categories, formData.specialCategory]
        : formData.categories;
      
      if (formData.categories.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một danh mục cho khóa học');
      }
      
      if (!formData.specialCategory) {
        throw new Error('Vui lòng chọn PRIVATE hoặc PUBLIC cho khóa học');
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
        categories: allCategories,
        thumbnail: thumbnailUrl,
        status: 'DRAFT', // Save as draft
        teacherId: formData.teacherId || (userData?._id || '')
      };
      
      console.log("Saving course data as draft:", courseData);
      
      // Call the create course API
      const response = await fetch(`${API_BASE_URL}/course/create`, {
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
      
      // Combined categories include regular and special categories
      const allCategories = formData.specialCategory 
        ? [...formData.categories, formData.specialCategory]
        : formData.categories;
      
      if (formData.categories.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một danh mục cho khóa học');
      }
      
      if (!formData.specialCategory) {
        throw new Error('Vui lòng chọn PRIVATE hoặc PUBLIC cho khóa học');
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
        categories: allCategories,
        thumbnail: thumbnailUrl,
        status: formData.status,
        teacherId: formData.teacherId || (userData?._id || '')
      };
      
      console.log("Creating course with data:", courseData);
      
      // Submit course data
      const response = await fetch(`${API_BASE_URL}/course/create`, {
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
      
      // Redirect to course management page after 1 second
      setTimeout(() => {
        router.push('/teacher/courses');
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
          href="/teacher/courses" 
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
                Giá (VNĐ) <span className="text-red-500">*</span>
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
                  <span className="text-sm text-gray-500">
                    Đã chọn: {formData.categories.length + (formData.specialCategory ? 1 : 0)}
                  </span>
                </div>
              </div>
                
              <div className="p-4 max-h-72 overflow-y-auto">
                {!Array.isArray(categories) || categories.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Không có danh mục nào</p>
                ) : (
                  <div>
                    {/* Special categories (PRIVATE/PUBLIC) section */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2 border-b pb-2">
                        Vui lòng chọn một trong hai
                      </h5>
                      <div className="space-y-3">
                        {categories
                          .filter(cat => cat.isSpecial)
                          .map(cat => {
                            if (!cat || !cat.categoryId) {
                              return null;
                            }
                            
                            const isSelected = formData.specialCategory === cat.categoryId;
                            return (
                              <div 
                                key={cat.categoryId} 
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                  ${isSelected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    specialCategory: isSelected ? '' : cat.categoryId
                                  });
                                }}
                              >
                                <input
                                  type="radio"
                                  name="specialCategory"
                                  checked={isSelected}
                                  onChange={() => {}} // Controlled by the div onClick
                                  className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <div className="ml-3 flex-1">
                                  <span className="text-gray-800 font-medium">{cat.categoryDisplayName || cat.categoryName || "Danh mục"}</span>
                                  {cat.categoryName && <span className="text-gray-500 text-sm ml-2">({cat.categoryName})</span>}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    
                    {/* Regular categories section */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2 border-b pb-2">
                        Chọn ít nhất một danh mục bình thường
                      </h5>
                      <div className="space-y-3">
                        {categories
                          .filter(cat => !cat.isSpecial)
                          .map(cat => {
                            if (!cat || !cat.categoryId) {
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
                    </div>
                  </div>
                )}
              </div>
                
              <div className="p-4 border-t bg-white">
                {/* Display validation messages */}
                {!formData.specialCategory && (
                  <div className="text-yellow-600 text-sm mb-2">
                    Vui lòng chọn PRIVATE hoặc PUBLIC cho khóa học
                  </div>
                )}
                
                {formData.categories.length === 0 && (
                  <div className="text-yellow-600 text-sm mb-2">
                    Vui lòng chọn ít nhất một danh mục bình thường
                  </div>
                )}
                
                {/* Display selected special category */}
                {formData.specialCategory && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Loại khóa học:</div>
                    <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm inline-block mb-2">
                      {categories.find(c => c.categoryId === formData.specialCategory)?.categoryDisplayName || formData.specialCategory}
                      <button
                        type="button"
                        className="ml-1.5 text-purple-500 hover:text-purple-700"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            specialCategory: ''
                          });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Display selected regular categories */}
                {formData.categories.length > 0 && (
                  <div>
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
            </div>
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
            href="/teacher/courses" 
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