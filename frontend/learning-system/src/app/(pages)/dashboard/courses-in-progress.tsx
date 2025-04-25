'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Định nghĩa interface cho khóa học đang học
interface CourseInProgress {
  id: string;
  title: string;
  thumbnail: string | null;
  teacherName: string;
  process: number;
  startDate: number[]; // API trả về mảng [year, month, day, ...]
  timeCurrent: number;
  status: string;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:8082/api';

export function CoursesInProgress() {
  const [courses, setCourses] = useState<CourseInProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoursesInProgress = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/course/progress-course`, {
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
            console.error('Dữ liệu từ API /progress-course không phải mảng:', courseData);
            setCourses([]);
          }
          setLoading(false);
        } else {
          throw new Error(data.message || 'Không thể tải danh sách khóa học đang học');
        }
      } catch (err) {
        console.error('Lỗi khi gọi API /progress-course:', err);
        setError((err instanceof Error ? err.message : 'Không xác định lỗi') || 'Không thể tải danh sách khóa học đang học');
        setLoading(false);
        if ((err as any)?.response?.status === 401 || (err as any)?.response?.status === 403) {
          window.location.href = '/login'; // Chuyển hướng nếu chưa đăng nhập
        }
      }
    };
    fetchCoursesInProgress();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#FF782D]">Khóa học đang học</CardTitle>
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
          <CardTitle className="text-[#FF782D]">Khóa học đang học</CardTitle>
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
        <CardTitle className="text-[#FF782D]">Khóa học đang học</CardTitle>
        <CardDescription>Tiếp tục học các khóa học của bạn từ nơi bạn đã dừng lại.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.length === 0 ? (
            <p>Chưa có khóa học nào đang học.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="flex gap-4 border rounded-lg p-4">
                <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={course.thumbnail || '/placeholder.svg'}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ</span>
                        <span>{Math.round(course.process)}%</span>
                      </div>
                      <Progress
                        value={course.process}
                        className="h-2 bg-[#FFE6D6] [&>div]:bg-[#FF782D]"
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Bắt đầu:{' '}
                      {course.startDate && course.startDate.length >= 3
                        ? new Date(
                          course.startDate[0],
                          course.startDate[1] - 1,
                          course.startDate[2]
                        ).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Giảng viên: {course.teacherName}
                    </p>
                  </div>
                  <div className="mt-2">
                    <Link href={`/courses/${course.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 self-start border-[#FF782D] text-[#FF782D] hover:bg-[#FF782D] hover:text-white transition"
                      >
                        Tiếp tục học
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