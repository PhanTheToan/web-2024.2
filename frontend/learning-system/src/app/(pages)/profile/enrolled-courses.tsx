import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, PlayCircle } from "lucide-react"
import Link from "next/link"

// Mock data for enrolled courses
const courses = [
  {
    id: 1,
    title: "Lập trình Web với React",
    image: "/placeholder.svg?height=100&width=180",
    instructor: "Trần Văn B",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    totalHours: 36,
    status: "in-progress",
  },
  {
    id: 2,
    title: "Thiết kế UI/UX chuyên nghiệp",
    image: "/placeholder.svg?height=100&width=180",
    instructor: "Lê Thị C",
    progress: 100,
    totalLessons: 18,
    completedLessons: 18,
    totalHours: 27,
    status: "completed",
  },
  {
    id: 3,
    title: "Nhập môn Machine Learning",
    image: "/placeholder.svg?height=100&width=180",
    instructor: "Phạm Văn D",
    progress: 30,
    totalLessons: 20,
    completedLessons: 6,
    totalHours: 40,
    status: "in-progress",
  },
]

export function EnrolledCourses() {
  return (
    <div className="space-y-6">
      {courses.map((course) => (
        <div key={course.id} className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row">
          <div className="shrink-0">
            <img
              src={course.image || "/placeholder.svg"}
              alt={course.title}
              className="h-[100px] w-full rounded-md object-cover md:w-[180px]"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">Giảng viên: {course.instructor}</p>
              </div>
              <Badge variant={course.status === "completed" ? "success" : "default"}>
                {course.status === "completed" ? "Hoàn thành" : "Đang học"}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Tiến độ: {course.progress}%</span>
                <span>
                  {course.completedLessons}/{course.totalLessons} bài học
                </span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.totalLessons} bài học</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.totalHours} giờ</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/courses/${course.id}`}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Tiếp tục học
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                Xem chứng chỉ
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

