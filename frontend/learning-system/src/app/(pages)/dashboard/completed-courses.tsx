import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for completed courses
const completedCourses = [
    {
        id: "completed-1",
        title: "HTML & CSS cơ bản",
        image: "/placeholder.svg?height=80&width=150",
        completedDate: "15/03/2024",
        instructor: "Nguyễn Văn A",
        certificate: true,
    },
    {
        id: "completed-2",
        title: "JavaScript cơ bản",
        image: "/placeholder.svg?height=80&width=150",
        completedDate: "22/02/2024",
        instructor: "Trần Thị B",
        certificate: true,
    },
    {
        id: "completed-3",
        title: "Git & GitHub",
        image: "/placeholder.svg?height=80&width=150",
        completedDate: "10/01/2024",
        instructor: "Lê Văn C",
        certificate: false,
    },
]

export function CompletedCourses() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-[#FF782D]">Khóa học đã hoàn thành</CardTitle>
                <CardDescription>Các khóa học bạn đã hoàn thành và chứng chỉ đạt được.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {completedCourses.map((course) => (
                        <div key={course.id} className="border rounded-lg overflow-hidden">
                            <div className="relative h-32 w-full">
                                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold">{course.title}</h3>
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <p>Giảng viên: {course.instructor}</p>
                                    <p>Hoàn thành: {course.completedDate}</p>
                                </div>
                                <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 self-start w-full border-[#FF782D] text-[#FF782D] hover:bg-[#FF782D] hover:text-white transition"
                                        >
                                            Xem chứng chỉ
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

