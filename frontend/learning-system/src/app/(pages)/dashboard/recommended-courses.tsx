import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock data for recommended courses
const recommendedCourses = [
    {
        id: "rec-1",
        title: "Node.js Nâng cao",
        image: "/placeholder.svg?height=80&width=150",
        match: "98% phù hợp",
        description: "Học cách xây dựng ứng dụng server-side với Node.js nâng cao.",
    },
    {
        id: "rec-2",
        title: "Docker cho Developers",
        image: "/placeholder.svg?height=80&width=150",
        match: "95% phù hợp",
        description: "Học cách sử dụng Docker để đóng gói và triển khai ứng dụng.",
    },
    {
        id: "rec-3",
        title: "TypeScript cơ bản",
        image: "/placeholder.svg?height=80&width=150",
        match: "92% phù hợp",
        description: "Học TypeScript để phát triển ứng dụng JavaScript mạnh mẽ hơn.",
    },
]

export function RecommendedCourses() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-[#FF782D]">Khóa học gợi ý</CardTitle>
                <CardDescription>Dựa trên sở thích và lịch sử học tập của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recommendedCourses.map((course) => (
                        <div key={course.id} className="flex gap-3 border rounded-lg p-3 transition">
                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                            </div>
                            <div className="flex flex-1 flex-col">
                                <div>
                                    <h4 className="font-medium hover:text-[#FF782D]">{course.title}</h4>
                                    <p className="text-xs text-[#666666]">{course.match}</p>
                                    <p className="mt-1 text-xs line-clamp-2 text-[#444]">{course.description}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 self-start border-[#FF782D] text-[#FF782D] hover:bg-[#FF782D] hover:text-white transition"
                                >
                                    Đăng ký
                                </Button>
                            </div>
                        </div>
                    ))}

                </div>
            </CardContent>
        </Card>
    )
}

