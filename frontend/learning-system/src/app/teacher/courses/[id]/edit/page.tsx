"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dotenv from 'dotenv';
dotenv.config();
// Define the CourseData interface for the form
interface CourseData {
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  totalDuration: number; // in minutes, calculated from lessons and quizzes timeLimit
  categories: string[]; // Changed from category to categories array
  isPublished: boolean;
}

// Define interface for user data
interface UserData {
  _id: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Improve type safety for category objects
interface CategoryData {
  name: string;
  id?: string;
  categoryId?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface CategoryItem {
  name: string;
  displayName?: string;
  id: string;
  categoryName?: string;
  categoryId?: string;
  count: number;
  isActive: boolean;
  isSpecial?: boolean; // Flag for PRIVATE/PUBLIC categories
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const API_BASE_URL = process.env.BASE_URL || 'https://api.alphaeducation.io.vn/api';

  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    price: 0,
    thumbnail: '',
    totalDuration: 0, // in minutes
    categories: [], // Changed from category to categories array
    isPublished: false,
  });
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Now stores IDs
  const [specialCategory, setSpecialCategory] = useState<string>(''); // Now stores ID
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Fetch course data and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course details via API
        
        // Check authentication first
        const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!authResponse.ok) {
          throw new Error('Bạn cần đăng nhập để tiếp tục');
        }
        
        const authData = await authResponse.json();
        const userData = authData.data;
        
        if (userData.role !== 'ROLE_TEACHER') {
          toast.error('Bạn không có quyền truy cập trang này');
          router.push('/login?redirect=/teacher/courses');
          return;
        }
        
        console.log("Authenticated user:", userData);
        console.log("Teacher ID from auth response:", userData._id);
        setUserData(userData);
        
        // Fetch course details
        const courseResponse = await fetch(`${API_BASE_URL}/course/info-course/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!courseResponse.ok) {
          throw new Error('Không thể tải thông tin khóa học');
        }
        
        const courseData = await courseResponse.json();
        const course = courseData.body || courseData;
        
        // Format course data
        setCourseData({
          title: course.title || '',
          description: course.description || '',
          price: course.price || 0,
          thumbnail: course.thumbnail || '',
          totalDuration: course.totalDuration || 0,
          categories: Array.isArray(course.categories) 
            ? course.categories.map((cat: CategoryData | string) => {
                // Safely handle the category which could be a string or an object
                if (typeof cat === 'object' && cat !== null && 'name' in cat) {
                  return cat.name;
                }
                return String(cat);
              }) 
            : [],
          isPublished: course.isPublished || course.courseStatus === 'ACTIVE' || false,
        });
        
        setThumbnailPreview(course.thumbnail || '');
        
        // Fetch featured categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories/featured-category`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error('Không thể tải danh mục khóa học');
        }
        
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.body || [];
        
        // Format categories based on the API response and mark special categories (PRIVATE/PUBLIC)
        setCategories(categories.map((cat: {
          categoryId?: string; 
          categoryName?: string;
          categoryDisplayName?: string | null;
        }) => ({
          name: cat.categoryName || '',
          displayName: cat.categoryDisplayName || cat.categoryName || '',
          id: cat.categoryId || '',
          count: 0,
          isActive: false,
          isSpecial: cat.categoryName === 'PRIVATE' || cat.categoryName === 'PUBLIC'
        })));
        
        // Process course categories - split into special and regular categories
        if (Array.isArray(course.categories)) {
          // Look for special category (PUBLIC or PRIVATE)
          const foundSpecialCategory = course.categories.find((cat: CategoryData | string) => {
            const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName || '') : String(cat);
            return catName === 'PRIVATE' || catName === 'PUBLIC';
          });
          
          if (foundSpecialCategory) {
            // Get the ID from the categories array for the special category
            const specialCatName = typeof foundSpecialCategory === 'object' && foundSpecialCategory !== null
              ? (foundSpecialCategory.name || foundSpecialCategory.categoryName || '')
              : String(foundSpecialCategory);
              
            const specialCategoryObj = categories.find((cat: CategoryItem) => cat.categoryName === specialCatName || cat.name === specialCatName);
            setSpecialCategory(specialCategoryObj?.categoryId || specialCategoryObj?.id || '');
          }
          
          // Filter out special categories to get regular categories and map to IDs
          const regularCategories = course.categories
            .filter((cat: CategoryData | string) => {
              const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName || '') : String(cat);
              return catName !== 'PRIVATE' && catName !== 'PUBLIC';
            })
            .map((cat: CategoryData | string) => {
              const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName || '') : String(cat);
              // Find the category in the categories array to get its ID
              const categoryObj = categories.find((c: CategoryItem) => c.categoryName === catName || c.name === catName);
              return categoryObj?.categoryId || categoryObj?.id || '';
            });
            
            setSelectedCategories(regularCategories.filter((id: string) => id !== '')); // Only set valid IDs
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Không thể tải dữ liệu khóa học. Vui lòng thử lại sau.');
        toast.error('Không thể tải dữ liệu khóa học');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId]);
  
  // Keep courseData.categories in sync with selectedCategories
  useEffect(() => {
    setCourseData(prev => ({
      ...prev,
      categories: selectedCategories // Now contains category IDs
    }));
  }, [selectedCategories]);
  
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
    } else if (name === 'categories') {
      // Handle multiple select for categories
      const options = (e.target as HTMLSelectElement).options;
      const selectedCategories: string[] = [];
      
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedCategories.push(options[i].value);
        }
      }
      
      setCourseData({
        ...courseData,
        categories: selectedCategories,
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
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      // Store the file for later upload
      setThumbnailFile(file);
      
      // Update course data with the preview URL temporarily
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
      
      if (selectedCategories.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một danh mục bình thường');
      }
      
      if (!specialCategory) {
        throw new Error('Vui lòng chọn PRIVATE hoặc PUBLIC cho khóa học');
      }

      // Check if teacher ID is available, if not, try to fetch it again
      if (!userData || !userData._id) {
        console.log("Teacher ID missing, trying to fetch again");
        
        const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("Re-fetching teacher data");
        if (authResponse.ok) {
          const authData = await authResponse.json();
          const newUserData = authData.data;
          
          console.log("Re-fetched teacher data:", newUserData);
          setUserData(newUserData);
        } else {
          throw new Error('Không thể xác thực thông tin giáo viên');
        }
      }
      
      // Combine regular categories with special category
      const allCategories = [...selectedCategories];
      if (specialCategory) {
        allCategories.push(specialCategory);
      }
      
      // Get the current teacher ID from state
      const teacherId = userData?.id;
      
      if (!teacherId) {
        console.error("Teacher ID is still not available");
        throw new Error("Không thể xác định ID giáo viên. Vui lòng thử lại.");
      }
      
      // Prepare the updated course data
      const updatedCourse = {
        id: courseId,
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        thumbnail: courseData.thumbnail,
        categories: allCategories, // Now uses category IDs
        status: courseData.isPublished ? 'ACTIVE' : 'INACTIVE',
        teacherId: teacherId
      };
      
      // Handle file upload if there's a new thumbnail
      if (thumbnailFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        
        try {
          // Upload the thumbnail file
          const uploadResponse = await fetch(`${API_BASE_URL}/upload/image/r2`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Không thể tải lên ảnh thumbnail');
          }
          
          const uploadData = await uploadResponse.json();
          const thumbnailUrl = uploadData.body?.url || uploadData.url;
          
          if (thumbnailUrl) {
            updatedCourse.thumbnail = thumbnailUrl;
          } else {
            console.warn("Thumbnail URL not found in upload response");
          }
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          throw new Error('Lỗi khi tải lên ảnh thumbnail');
        }
      }
      console.log(updatedCourse);
      console.log("Teacher ID included:", teacherId);
      console.log("Teacher data:", userData);
      console.log("Category IDs being sent:", allCategories);
      
      // Final validation check
      if (!updatedCourse.teacherId) {
        throw new Error("Thiếu thông tin giáo viên, không thể cập nhật khóa học");
      }
      console.log("updatedCourse: ", updatedCourse);
      // Update the course via API - using the new endpoint format
      const updateResponse = await fetch(`${API_BASE_URL}/course/update/course-info/${courseId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedCourse.title,
          description: updatedCourse.description,
          price: updatedCourse.price,
          thumbnail: updatedCourse.thumbnail,
          categories: updatedCourse.categories,
          status: updatedCourse.status,
          teacherId: updatedCourse.teacherId
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Không thể cập nhật khóa học');
      }
      
      // Parse response
      const responseData = await updateResponse.json();
      console.log("Update response:", responseData);
      
      // Check for success response based on the API response format
      if (responseData.statusCode !== "OK" && responseData.body !== "Update succesfully") {
        throw new Error(responseData.body || 'Không thể cập nhật khóa học');
      }
      
      // Show success message
      setSuccess(true);
      toast.success('Cập nhật khóa học thành công!');
      
      // Redirect after a delay
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating course:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật khóa học. Vui lòng thử lại sau.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-2">
        <Link 
          href={`/teacher/courses/${courseId}`} 
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa khóa học</h1>
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
                Giá khóa học (VNĐ) <span className="text-red-500">*</span>
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Chọn danh mục cho khóa học</h4>
                    <span className="text-sm text-gray-500">
                      Đã chọn: {selectedCategories.length + (specialCategory ? 1 : 0)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 max-h-72 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Không có danh mục nào</p>
                  ) : (
                    <div>
                      {/* Special categories section (PUBLIC/PRIVATE) */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2 border-b pb-2">
                          Vui lòng chọn một trong hai
                        </h5>
                        
                        <div className="space-y-3">
                          {categories
                            .filter(cat => cat.isSpecial)
                            .map(cat => (
                              <div 
                                key={cat.id || cat.name} 
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                  ${specialCategory === cat.id ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                                onClick={() => setSpecialCategory(specialCategory === cat.id ? '' : cat.id)}
                              >
                                <input
                                  type="radio"
                                  name="specialCategory"
                                  checked={specialCategory === cat.id}
                                  onChange={() => {}}
                                  className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <div className="ml-3 flex-1">
                                  <span className="text-gray-800 font-medium">{cat.name}</span>
                                </div>
                              </div>
                            ))}
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
                              const isSelected = selectedCategories.includes(cat.id);
                              return (
                                <div 
                                  key={cat.id || cat.name} 
                                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                    ${isSelected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedCategories(prev => prev.filter(id => id !== cat.id));
                                    } else {
                                      setSelectedCategories(prev => [...prev, cat.id]);
                                    }
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
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t bg-white">
                  {/* Display validation messages */}
                  {!specialCategory && (
                    <div className="text-yellow-600 text-sm mb-2">
                      Vui lòng chọn PRIVATE hoặc PUBLIC cho khóa học
                    </div>
                  )}
                  
                  {selectedCategories.length === 0 && (
                    <div className="text-yellow-600 text-sm mb-2">
                      Vui lòng chọn ít nhất một danh mục bình thường
                    </div>
                  )}
                  
                  {/* Display selected special category */}
                  {specialCategory && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Loại khóa học:</div>
                      <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm inline-block mb-2">
                        {categories.find(cat => cat.id === specialCategory)?.name || specialCategory}
                        <button
                          type="button"
                          className="ml-1.5 text-purple-500 hover:text-purple-700"
                          onClick={() => setSpecialCategory('')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Display selected regular categories */}
                  {selectedCategories.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Danh mục đã chọn:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(categoryId => {
                          const category = categories.find(cat => cat.id === categoryId);
                          return (
                            <div 
                              key={categoryId}
                              className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm"
                            >
                              {category?.name || categoryId}
                              <button
                                type="button"
                                className="ml-1.5 text-indigo-500 hover:text-indigo-700"
                                onClick={() => setSelectedCategories(prev => prev.filter(id => id !== categoryId))}
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="totalDuration">
                Tổng thời gian (phút)
              </label>
              <input
                type="number"
                id="totalDuration"
                name="totalDuration"
                value={courseData.totalDuration}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Thời gian được tính tự động từ bài học và bài kiểm tra</p>
            </div>
            
            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={courseData.isPublished}
                  onChange={handleInputChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                />
                <span className="text-gray-700 font-medium">Đang hoạt động</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-7">
                Khi được bật, khóa học sẽ hiển thị cho học viên. Khi tắt, khóa học sẽ bị ẩn.
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Ảnh thu nhỏ <span className="text-gray-500 font-normal">(16:9 tỷ lệ khuyến nghị)</span>
            </label>
            
            {thumbnailPreview ? (
              <div className="mb-4 relative">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailPreview('');
                    setCourseData({...courseData, thumbnail: ''});
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:bg-red-50"
                  title="Remove thumbnail"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="thumbnail-upload" className="cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-700">
                      <span>Tải lên ảnh thu nhỏ</span>
                      <input
                        id="thumbnail-upload"
                        name="thumbnail"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-6 border-t">
            <Link
              href={`/teacher/courses/${courseId}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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