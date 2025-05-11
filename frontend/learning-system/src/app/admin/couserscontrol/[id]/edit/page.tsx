"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';
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
  totalTimeLimit: number; // Total time limit in minutes
  categories: string[]; // Regular category IDs
  specialCategory: string; // For PRIVATE or PUBLIC category ID
  teacherId: string;
  teacherName: string; // To display teacher name
  isPopular: boolean; 
  isPublished: boolean;
}

// Update Category interface to include isSpecial flag
interface CategoryItem {
  name: string;
  displayName: string;
  id: string;
  count: number;
  isActive: boolean;
  isSpecial?: boolean; // Flag for PRIVATE/PUBLIC categories
}

interface CategoryOrString {
  name?: string;
  categoryName?: string;
  [key: string]: unknown;
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
    totalDuration: 0,
    totalTimeLimit: 0,
    categories: [],
    specialCategory: '',
    teacherId: '',
    teacherName: '',
    isPopular: false,
    isPublished: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';
  // Fetch course data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("fetching course data...", {courseId});
        
        // Fetch course info using the new API endpoint from the first image
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
        console.log("courseData", courseData);
        const course = courseData.body || courseData;
        
        // Fetch featured categories using the /api/categories/featured-category endpoint
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
        const categoriesArray = categoriesData.body || [];
        
        // Format categories based on the actual API response format and mark special categories
        setCategories(categoriesArray.map((cat: {
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
        
        // Process teacher ID and name
        const teacherId = course.teacherId || '';
        const teacherName = course.teacherName || '';
        
        // Process categories with proper typing
        const processedCategories = Array.isArray(course.categories) 
          ? course.categories.filter((cat: string | CategoryOrString) => {
              if (typeof cat === 'string') {
                return cat !== 'PRIVATE' && cat !== 'PUBLIC';
              } else {
                const catName = cat?.name || cat?.categoryName || '';
                return catName !== 'PRIVATE' && catName !== 'PUBLIC';
              }
            }).map((cat: string | CategoryOrString) => {
              const catName = typeof cat === 'string' ? cat : (cat?.name || cat?.categoryName || '');
              // Find the corresponding category ID
              const categoryObj = categoriesArray.find((c: {
                categoryId?: string;
                categoryName?: string;
                name?: string;
              }) => 
                c.categoryName === catName || c.name === catName
              );
              return categoryObj?.categoryId || '';
            })
          : [];
          
        // Find the special category (PRIVATE or PUBLIC)
        let specialCategory = '';
        if (Array.isArray(course.categories)) {
          const foundSpecialCategory = course.categories.find((cat: string | CategoryOrString) => {
            if (typeof cat === 'string') {
              return cat === 'PRIVATE' || cat === 'PUBLIC';
            } else {
              const catName = cat?.name || cat?.categoryName || '';
              return catName === 'PRIVATE' || catName === 'PUBLIC';
            }
          });
          
          if (foundSpecialCategory) {
            const specialCatName = typeof foundSpecialCategory === 'string' 
              ? foundSpecialCategory 
              : (foundSpecialCategory?.name || foundSpecialCategory?.categoryName || '');
              
            // Find the corresponding category ID
            const specialCategoryObj = categoriesArray.find((c: {
              categoryId?: string;
              categoryName?: string;
              name?: string;
            }) => 
              c.categoryName === specialCatName || c.name === specialCatName
            );
            specialCategory = specialCategoryObj?.categoryId || '';
          }
        }
        
        // Set course data in the form
        setCourseData({
          title: course.title || '',
          description: course.description || '',
          price: course.price || 0,
          thumbnail: course.thumbnail || '',
          totalDuration: 0, // This will be set based on totalTimeLimit
          totalTimeLimit: course.totalTimeLimit || 0,
          categories: processedCategories,
          specialCategory: specialCategory,
          teacherId: teacherId,
          teacherName: teacherName,
          isPopular: processedCategories.includes('POPULAR'),
          isPublished: course.status === 'ACTIVE',
        });
        
        // Set selected categories to match course categories
        setSelectedCategories(processedCategories);
        
        // Set thumbnail preview
        if (course.thumbnail) {
          setThumbnailPreview(course.thumbnail);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
        toast.error("Không thể tải thông tin khóa học");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);
  
  // Update totalDuration whenever totalTimeLimit changes
  useEffect(() => {
    setCourseData(prev => ({
      ...prev,
      totalDuration: prev.totalTimeLimit
    }));
  }, [courseData.totalTimeLimit]);
  
  // Keep courseData.categories in sync with selectedCategories
  useEffect(() => {
    setCourseData(prev => ({
      ...prev,
      categories: selectedCategories
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
      
      setSelectedCategories(selectedCategories);
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
      
      if (courseData.categories.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một danh mục cho khóa học');
      }
      
      if (!courseData.specialCategory) {
        throw new Error('Vui lòng chọn PRIVATE hoặc PUBLIC cho khóa học');
      }
      
      // Combine regular categories with special category
      const allCategories = [...courseData.categories];
      
      // Add special category if selected
      if (courseData.specialCategory) {
        allCategories.push(courseData.specialCategory);
      }
      
      // Add POPULAR if isPopular is checked
      if (courseData.isPopular) {
        const popularCategoryObj = categories.find(cat => cat.name === 'POPULAR');
        if (popularCategoryObj && popularCategoryObj.id && !allCategories.includes(popularCategoryObj.id)) {
          allCategories.push(popularCategoryObj.id);
        }
      }
      
      // Prepare the updated course data
      const updatedCourse = {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        status: courseData.isPublished ? 'ACTIVE' : 'INACTIVE',
        teacherId: courseData.teacherId,
        thumbnail: courseData.thumbnail,
        categories: allCategories // Send as categoryIds
      };
      
      // Handle file upload if there's a new thumbnail
      if (thumbnailFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        
        try {
          // Upload the thumbnail file using the /api/upload/image endpoint
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
      console.log("updatedCourse", updatedCourse);
      // Update the course using the new API endpoint from the second image
      const updateResponse = await fetch(`${API_BASE_URL}/course/update/course-info/${courseId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCourse),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Không thể cập nhật khóa học');
      }
      
      // Show success message
      setSuccess(true);
      toast.success('Cập nhật khóa học thành công!');
      
      // Redirect after a delay
      setTimeout(() => {
        router.push(`/admin/couserscontrol/${courseId}`);
      }, 2000);
    } catch (err) {
      console.error("Error updating course:", err);
      const errorMessage = err instanceof Error ? err.message : "Không thể cập nhật khóa học. Vui lòng thử lại sau.";
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
              Giảng viên
            </label>
            <div className="flex items-center">
              <div className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-md w-full">
                <span>{courseData.teacherName}</span>
              </div>
            </div>
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
                      Đã chọn: {selectedCategories.length + (courseData.specialCategory ? 1 : 0)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 max-h-72 overflow-y-auto">
                  {categories.length === 0 ? (
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
                              if (!cat || !cat.name) {
                                return null;
                              }
                              
                              const isSelected = courseData.specialCategory === cat.id;
                              return (
                                <div 
                                  key={cat.id || cat.name} 
                                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                    ${isSelected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                                  onClick={() => {
                                    setCourseData({
                                      ...courseData,
                                      specialCategory: isSelected ? '' : cat.id
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
                                    <span className="text-gray-800 font-medium">{cat.displayName || cat.name}</span>
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
                              if (!cat || !cat.name) {
                                return null;
                              }
                              
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
                                    <span className="text-gray-800 font-medium">{cat.displayName || cat.name}</span>
                                  </div>
                                  {cat.count > 0 && (
                                    <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                      {cat.count} khóa học
                                    </span>
                                  )}
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
                  {!courseData.specialCategory && (
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
                  {courseData.specialCategory && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Loại khóa học:</div>
                      <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm inline-block mb-2">
                        {categories.find(cat => cat.id === courseData.specialCategory)?.displayName || 
                         categories.find(cat => cat.id === courseData.specialCategory)?.name}
                        <button
                          type="button"
                          className="ml-1.5 text-purple-500 hover:text-purple-700"
                          onClick={() => {
                            setCourseData({
                              ...courseData,
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
                              {category?.displayName || category?.name}
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
              <label className="block font-medium mb-1" htmlFor="totalDuration">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                id="totalTimeLimit"
                name="totalTimeLimit"
                className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
                value={courseData.totalTimeLimit || courseData.totalDuration}
                disabled
              />
              <p className="text-gray-500 text-xs mt-1">Thời lượng được tính từ các bài học và bài kiểm tra</p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Trạng thái
              </label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPopular"
                    name="isPopular"
                    checked={courseData.isPopular}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                  />
                  <span className="text-gray-700">Đánh dấu là khóa học phổ biến</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={courseData.isPublished}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                  />
                  <span className="text-gray-700">Đang hoạt động</span>
                </label>
                <p className="text-xs text-gray-500 ml-7">Khi được bật, khóa học đang hoạt động. Khi tắt, khóa học sẽ bị vô hiệu hóa.</p>
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
                      setThumbnailPreview(null);
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