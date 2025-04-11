"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Course, LessonMaterial } from "@/app/types";
import { toast } from "react-hot-toast";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

export default function CreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [shortTitle, setShortTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [timeLimit, setTimeLimit] = useState(45);
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [orderLesson, setOrderLesson] = useState(1);
  const [orderInfo, setOrderInfo] = useState<{
    maxOrder: number;
    maxLessonOrder: number;
    maxQuizOrder: number;
    nextOrder: number;
  }>({ maxOrder: 0, maxLessonOrder: 0, maxQuizOrder: 0, nextOrder: 1 });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log("Fetching course:", courseId);
        const response = await fetch(`${API_BASE_URL}/course/info/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const courseData = await response.json();
        let parsedCourse;
        
        if (courseData.body) {
          parsedCourse = courseData.body;
        } else {
          parsedCourse = courseData;
        }
        
        console.log("Course data:", parsedCourse);
        setCourse(parsedCourse);
        
        // Sau khi lấy thông tin khóa học, lấy danh sách bài học
        fetchLessons(courseId);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);
  
  // Hàm để lấy danh sách bài học và xác định orderLesson tiếp theo
  const fetchLessons = async (courseId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/course/lesson_quiz/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch lessons");
      }

      const data = await response.json();
      console.log("Lessons and quizzes data:", data);
      
      // Theo hình ảnh API, dữ liệu trả về có cấu trúc:
      // { body: { lessons: [...], quizzes: [...] } }
      
      let maxOrder = 0;
      let maxLessonOrder = 0;
      let maxQuizOrder = 0;
      
      // Xử lý mảng lessons từ API
      const lessons = data.body?.lessons || [];
      if (Array.isArray(lessons)) {
        lessons.forEach(lesson => {
          if (lesson.orderLesson && lesson.orderLesson > maxLessonOrder) {
            maxLessonOrder = lesson.orderLesson;
            maxOrder = Math.max(maxOrder, lesson.orderLesson);
          }
        });
      }
      
      // Xử lý mảng quizzes từ API
      const quizzes = data.body?.quizzes || [];
      if (Array.isArray(quizzes)) {
        quizzes.forEach(quiz => {
          if (quiz.orderQuiz && quiz.orderQuiz > maxQuizOrder) {
            maxQuizOrder = quiz.orderQuiz;
            maxOrder = Math.max(maxOrder, quiz.orderQuiz);
          }
        });
      }
      
      // Đặt orderLesson mới là maxOrder + 1
      const nextOrder = maxOrder + 1;
      setOrderLesson(nextOrder);
      console.log("Max order values:", { maxOrder, maxLessonOrder, maxQuizOrder, nextOrder });
      
      // Lưu thông tin để hiển thị UI
      setOrderInfo({
        maxOrder,
        maxLessonOrder,
        maxQuizOrder,
        nextOrder
      });
    } catch (err) {
      console.error("Error fetching lessons:", err);
      // Không cần thiết lập lỗi, giữ giá trị mặc định là 1
    }
  };

  // Hàm upload file tài liệu
  const uploadFile = async (files: File[]): Promise<string[]> => {
    try {
      const formData = new FormData();
      
      // Thêm nhiều file vào formData
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Lỗi tải lên tài liệu: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("File upload response:", data);
      
      // Dựa vào ảnh, chúng ta thấy API trả về cấu trúc một mảng các URL, không có trường body hay urls
      if (data && Array.isArray(data)) {
        // Ảnh cho thấy format là mảng string
        return data.filter(url => typeof url === 'string');
      }
      
      // Nếu không phải mảng, kiểm tra các trường hợp khác
      if (data && data.body && Array.isArray(data.body.urls)) {
        return data.body.urls;
      }
      
      console.error("Response structure:", JSON.stringify(data));
      throw new Error("Không nhận dạng được URL tệp sau khi tải lên");
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setFileError(null);
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    
    // Kiểm tra từng file
    for (const file of files) {
      // Check file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFileError(`File "${file.name}": Chỉ chấp nhận định dạng PDF, DOCX, JPEG và PNG.`);
        continue;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`File "${file.name}": Kích thước tập tin vượt quá giới hạn 5MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
      return;
    }

    try {
      setUploadingFiles(true);
      // Upload nhiều file và lấy mảng URL
      const fileUrls = await uploadFile(validFiles);
      
      // Tạo các object material mới với URL thực
      const newMaterials = validFiles.map((file, index) => {
        // Xác định loại file
        const fileType = file.type.includes('pdf') ? 'pdf' : 
                       file.type.includes('word') ? 'doc' : 'image';
        
        return {
          name: file.name,
          type: fileType as 'pdf' | 'doc' | 'image' | 'other',
          path: fileUrls[index] || '',
          size: file.size
        };
      }).filter(material => material.path !== ''); // Loại bỏ các material không có path

      setMaterials([...materials, ...newMaterials]);
      
      if (newMaterials.length === 1) {
        toast.success(`Tài liệu "${newMaterials[0].name}" đã được tải lên thành công`);
      } else {
        toast.success(`${newMaterials.length} tài liệu đã được tải lên thành công`);
      }
    } catch (error) {
      console.error("Upload file error:", error);
      setFileError("Lỗi khi tải tập tin lên máy chủ. Vui lòng thử lại.");
    } finally {
      setUploadingFiles(false);
      e.target.value = ''; // Reset input
    }
  };

  const removeMaterial = (index: number) => {
    const updatedMaterials = [...materials];
    updatedMaterials.splice(index, 1);
    setMaterials(updatedMaterials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError("Vui lòng điền tiêu đề và nội dung bài học");
      return;
    }

    if (timeLimit <= 0) {
      setError("Thời gian học phải lớn hơn 0 phút");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      // Chuẩn bị danh sách URL tài liệu
      const materialPaths = materials.map(m => m.path);
      console.log("title", title);
      console.log("shortTitle", shortTitle);
      console.log("content", content);
      console.log("videoUrl", videoUrl);
      console.log("materialPaths", materialPaths);
      console.log("orderLesson", orderLesson);
      console.log("timeLimit", timeLimit);
      console.log("courseId", courseId);

      // Gửi yêu cầu tạo bài học
      const response = await fetch(`${API_BASE_URL}/course/create-lesson?courseId=${courseId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          shortTile: shortTitle || title,
          content: content,
          videoUrl: videoUrl,
          materials: materialPaths,
          order: orderLesson, // Sử dụng orderLesson đã được tính toán
          timeLimit: timeLimit
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Không thể tạo bài học");
      }

      const data = await response.json();
      console.log("Lesson created successfully:", data);

      setSuccess(true);
      toast.success("Bài học đã được tạo thành công!");
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}`);
      }, 2000);
    } catch (err) {
      console.error("Error creating lesson:", err);
      setError("Không thể tạo bài học. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-700">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || "Không tìm thấy thông tin khóa học"}</p>
            </div>
          </div>
        </div>
        <Link
          href={`/teacher/courses`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="text-gray-500 hover:text-gray-700 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Thêm bài học mới</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Khóa học</div>
          <div className="text-lg font-medium">{course.title}</div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Bài học đã được tạo thành công! Đang chuyển hướng...</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề bài học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="shortTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề ngắn
            </label>
            <input
              type="text"
              id="shortTitle"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              placeholder="Tiêu đề hiển thị ngắn gọn (nếu để trống sẽ dùng tiêu đề chính)"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="orderLesson" className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự bài học <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="orderLesson"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={orderLesson}
                onChange={(e) => setOrderLesson(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                required
              />
              <div className="ml-3 text-sm text-gray-500">
                (Tự động đặt là phần cuối khóa học)
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <div>Thông tin hiện tại của khóa học:</div>
              <div>- Thứ tự cao nhất của bài học: {orderInfo.maxLessonOrder || 'Chưa có'}</div>
              <div>- Thứ tự cao nhất của bài quiz: {orderInfo.maxQuizOrder || 'Chưa có'}</div>
              <div>- Thứ tự cao nhất trong khóa học: {orderInfo.maxOrder || 'Chưa có'}</div>
              <div className="text-indigo-600 font-medium">→ Thứ tự tiếp theo: {orderInfo.nextOrder}</div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung bài học <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL video (YouTube, Vimeo, v.v.)
            </label>
            <input
              type="url"
              id="videoUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="timeLimit">
              Thời gian học (phút) <span className="text-red-500">*</span>
            </label>
            <input
              id="timeLimit"
              type="number"
              min="1"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Nhập thời gian học (phút)"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài liệu học tập
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 mb-3">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <div className="mt-2">
                  <label htmlFor="file-upload" className={`cursor-pointer ${uploadingFiles ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="mt-2 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      {uploadingFiles ? 'Đang tải lên...' : 'Kéo thả file vào đây hoặc nhấn để chọn'}
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleMaterialUpload}
                      accept=".pdf,.docx,.jpeg,.jpg,.png"
                      disabled={uploadingFiles}
                      multiple
                    />
                  </label>
                  <span className="mt-1 block text-xs text-gray-500">
                    Định dạng hỗ trợ: PDF, DOCX, JPEG, PNG (tối đa 5MB)
                  </span>
                </div>
              </div>
            </div>

            {fileError && (
              <div className="text-sm text-red-500 mb-2">{fileError}</div>
            )}

            {materials.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tài liệu đã tải lên</h4>
                <ul className="space-y-2">
                  {materials.map((material, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232L18 8M5.232 15.232L8 18M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                        <span className="text-sm">{material.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Link
              href={`/teacher/courses/${courseId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || uploadingFiles}
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tạo bài học
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 