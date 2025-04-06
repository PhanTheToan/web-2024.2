"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/courseService";
import { lessonService } from "@/services/lessonService";
import Link from "next/link";
import { ArrowLeft, FileText, Upload, Save } from "lucide-react";
import { Course, LessonMaterial } from "@/app/types";

export default function CreateLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const fetchedCourse = await courseService.getCourseById(courseId);
        setCourse(fetchedCourse);
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

  const handleMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setFileError(null);
    const file = e.target.files[0];
    
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFileError("Chỉ chấp nhận file PDF, DOCX, JPEG và PNG.");
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Kích thước tập tin vượt quá giới hạn 5MB.");
      return;
    }

    // Create a material object (in a real app, this would upload to a server)
    const fileType = file.type.includes('pdf') ? 'pdf' : 
                    file.type.includes('word') ? 'doc' : 'image';
    
    const newMaterial: LessonMaterial = {
      name: file.name,
      type: fileType as 'pdf' | 'doc' | 'image' | 'other',
      path: URL.createObjectURL(file),
      size: file.size
    };

    setMaterials([...materials, newMaterial]);
    e.target.value = ''; // Reset input
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

    try {
      setError(null);
      setSubmitting(true);

      // Prepare material paths only - in a real app, these would be URLs to stored files
      const materialPaths = materials.map(m => m.path);

      // Create the lesson
      await lessonService.createLesson({
        courseId,
        title,
        description,
        content,
        videoUrl,
        materials: materialPaths 
      });

      setSuccess(true);
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ngắn
            </label>
            <input
              type="text"
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài liệu học tập
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 mb-3">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Kéo thả file vào đây hoặc nhấn để chọn
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleMaterialUpload}
                      accept=".pdf,.docx,.jpeg,.jpg,.png"
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
                        <FileText className="h-4 w-4 text-indigo-500 mr-2" />
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
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
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