'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Định nghĩa interface cho khóa học đã hoàn thành
interface CompletedCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  teacherName: string;
  completeDate: string | number[]; // API có thể trả về string hoặc mảng
  status: string;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

export function CompletedCourses() {
  const [courses, setCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/course/complete-course`, {
          method: 'GET',
          credentials: 'include', // Đảm bảo cookie được gửi
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          // Lấy data.body và kiểm tra xem nó có phải mảng không
          const courseData = data.body || [];
          if (Array.isArray(courseData)) {
            setCourses(courseData);
          } else {
            console.error('Dữ liệu từ API /complete-course không phải mảng:', courseData);
            setCourses([]);
          }
          setLoading(false);
        } else {
          throw new Error(data.message || 'Không thể tải danh sách khóa học đã hoàn thành');
        }
      } catch (err) {
        console.error('Lỗi khi gọi API /complete-course:', err);
        if (err instanceof Error) {
          setError(err.message || 'Không thể tải danh sách khóa học đã hoàn thành');
        } else {
          setError('Không thể tải danh sách khóa học đã hoàn thành');
        }
        setLoading(false);
        if (typeof err === 'object' && err !== null && 'response' in err && (err as any).response?.status === 401 || (err as any).response?.status === 403) {
          window.location.href = '/login'; // Chuyển hướng nếu chưa đăng nhập
        }
      }
    };
    fetchCompletedCourses();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#FF782D]">Khóa học đã hoàn thành</CardTitle>
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
          <CardTitle className="text-[#FF782D]">Khóa học đã hoàn thành</CardTitle>
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
        <CardTitle className="text-[#FF782D]">Khóa học đã hoàn thành</CardTitle>
        <CardDescription>Các khóa học bạn đã hoàn thành và chứng chỉ đạt được.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 ? (
            <p>Chưa có khóa học nào hoàn thành.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="border rounded-lg overflow-hidden">
                <div className="relative h-32 w-full">
                  <Image
                    src={course.thumbnail || '/placeholder.svg'}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{course.title}</h3>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Giảng viên: {course.teacherName}</p>
                    <p>
                      Hoàn thành:{' '}
                      {Array.isArray(course.completeDate) && course.completeDate.length >= 3
                        ? new Date(
                          course.completeDate[0],
                          course.completeDate[1] - 1,
                          course.completeDate[2]
                        ).toLocaleDateString('vi-VN')
                        : typeof course.completeDate === 'string'
                          ? new Date(course.completeDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                    </p>
                  </div>
                  <div className="mt-4">

                    <Link href="/contact">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 self-start w-full border-[#FF782D] text-[#FF782D] hover:bg-[#FF782D] hover:text-white transition"
                      >
                        Đăng ký nhận chứng chỉ
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}