'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Định nghĩa interface cho khóa học chưa bắt đầu
interface NotStartedCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  teacherName: string;
  description: string;
  status: string;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

export function RecommendedCourses() {
  const [courses, setCourses] = useState<NotStartedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotStartedCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/course/notstarted-course`, {
          method: 'GET',
          credentials: 'include', // Đảm bảo cookie được gửi
        });

        const data = await response.json();

        if (response.ok) {
          // Lấy data.body và kiểm tra xem nó có phải mảng không
          const courseData = data.body || [];
          if (Array.isArray(courseData)) {
            setCourses(courseData);
          } else {
            console.error('Dữ liệu từ API /notstarted-course không phải mảng:', courseData);
            setCourses([]);
          }
          setLoading(false);
        } else {
          throw new Error(data.message || 'Không thể tải danh sách khóa học chưa bắt đầu');
        }
      } catch (err) {
        console.error('Lỗi khi gọi API /notstarted-course:', err);
        setError(err.message || 'Không thể tải danh sách khóa học chưa bắt đầu');
        setLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          window.location.href = '/login'; // Chuyển hướng nếu chưa đăng nhập
        }
      }
    };
    fetchNotStartedCourses();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#FF782D]">Khóa học chưa bắt đầu</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#FF782D]">Khóa học chưa bắt đầu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#FF782D]">Khóa học chưa bắt đầu</CardTitle>
        <CardDescription>Dựa trên sở thích và lịch sử học tập của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.length === 0 ? (
            <p>Chưa có khóa học nào chưa bắt đầu.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="flex gap-3 border rounded-lg p-3 transition">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={course.thumbnail && typeof course.thumbnail === 'string' ? course.thumbnail : '/placeholder.svg'}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div>
                    <h4 className="font-medium hover:text-[#FF782D]">{course.title}</h4>
                    <p className="text-xs text-[#666666]">{course.teacherName}</p>
                    <p className="mt-1 text-xs line-clamp-2 text-[#444]">{course.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 self-start border-[#FF782D] text-[#FF782D] hover:bg-[#FF782D] hover:text-white transition"
                  >
                    Bắt đầu học
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}