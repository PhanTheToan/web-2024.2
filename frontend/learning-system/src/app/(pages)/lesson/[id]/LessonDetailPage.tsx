"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import BreadcrumbContainer from "@/app/components/breadcrumb/BreadcrumbContainer";
import { Lesson } from "@/app/types";
import { lessonService } from "@/services/lessonService";

const LessonDetailPage: React.FC = () => {
  const params = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const lessonId = params.id as string;
        const lessonData = await lessonService.getLessonById(lessonId);
        setLesson(lessonData);
      } catch {
        setError('Không thể tải thông tin bài học');
        toast.error('Không thể tải thông tin bài học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [params.id]);

  const handleMarkComplete = async () => {
    if (!lesson) return;
    try {
      await lessonService.markLessonComplete(lesson._id);
      toast.success('Đã đánh dấu hoàn thành bài học');
    } catch {
      toast.error('Không thể đánh dấu hoàn thành bài học');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Không tìm thấy bài học
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Video Player Section */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={lesson.videoUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Lesson Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <button
                onClick={handleMarkComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Đánh dấu đã học xong
              </button>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-600">{lesson.content}</p>
            </div>

            {/* Materials Section */}
            {lesson.materials && lesson.materials.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Tài liệu học tập</h2>
                <ul className="space-y-2">
                  {lesson.materials.map((material, index) => (
                    <li key={index}>
                      <a
                        href={material}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Tài liệu {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailPage; 