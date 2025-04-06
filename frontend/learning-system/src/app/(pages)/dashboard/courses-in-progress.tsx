import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

// Mock data for courses in progress
const coursesInProgress = [
    {
        id: "course-1",
        title: "JavaScript Nâng cao",
        image: "/placeholder.svg?height=100&width=200",
        progress: 65,
        nextLesson: "Promises và Async/Await",
        lastAccessed: "Hôm nay",
    },
    {
        id: "course-2",
        title: "Thiết kế Responsive",
        image: "/placeholder.svg?height=100&width=200",
        progress: 42,
        nextLesson: "CSS Grid Layout",
        lastAccessed: "Hôm qua",
    },
    {
        id: "course-3",
        title: "Node.js cơ bản",
        image: "/placeholder.svg?height=100&width=200",
        progress: 89,
        nextLesson: "RESTful API",
        lastAccessed: "3 ngày trước",
    },
]

export function CoursesInProgress() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-[#FF782D]">Khóa học đang học</CardTitle>
                <CardDescription>Tiếp tục học các khóa học của bạn từ nơi bạn đã dừng lại.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {coursesInProgress.map((course) => (
                        <div key={course.id} className="flex gap-4 border rounded-lg p-4">
                            <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md">
                                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold">{course.title}</h3>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Tiến độ</span>
                                            <span>{course.progress}%</span>
                                        </div>
                                        {/* <Progress value={course.progress} className="h-2" /> */}
                                        <Progress value={course.progress} className="h-2 bg-[#FFE6D6] [&>div]:bg-[#FF782D]" />
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">Bài học tiếp theo: {course.nextLesson}</p>
                                </div>
                                <div className="mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 self-start border-[#FF782D] text-[#FF782D] hover:bg-[#FF782D] hover:text-white transition"
                                    >
                                        Tiếp tục học
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

