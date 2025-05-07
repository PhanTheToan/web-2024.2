import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from "@mui/material";
import { Clock, Users } from "lucide-react";
import Link from 'next/link';  // Import Link from next/link

interface Course {
  id: number;
  title: string;
  instructor: string;
  categories: string[];
  totalTimeLimit: number; // tổng số phút
  studentsCount: number;
  price: number;
  currentPrice: number | null;
  thumbnail: string;
  teacherFullName: string;
}

interface CourseGridProps {
  courses: Course[];
}

// Convert phút -> định dạng 1h50p
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours}h` : ''}${mins > 0 ? `${mins}p` : ''}` || "0p";
}

// Hàm định dạng tiền VNĐ
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export default function CourseGrid({ courses }: CourseGridProps) {
  return (
    <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }} gap={3}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </Box>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} passHref>
      <Card
        sx={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 470,
          borderRadius: 4,
          backgroundColor: "#fff",
          transition: "0.3s",
          '&:hover': {
            transform: "scale(1.03)",
            boxShadow: 3,
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Chip
            label={course.categories?.[0] || "Uncategorized"}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              backgroundColor: "black",
              color: "white"
            }}
          />
          <CardMedia sx={{ height: 250 }} image={course.thumbnail} title={course.title} />
        </Box>
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>
            by {course.teacherFullName}
          </Typography>
          <Typography variant="h6" fontWeight="bold" mb={2}>{course.title}</Typography>
          <Box display="flex" alignItems="center" gap={2} mt="auto">
            <Box display="flex" alignItems="center" gap={1}>
              <Clock className="h-5 w-5 text-orange-500" />
              <Typography variant="body2" fontWeight={600} fontSize={18}>
                {formatDuration(course.totalTimeLimit)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Users className="h-5 w-5 text-orange-500" />
              <Typography variant="body2" fontWeight={600} fontSize={18}>
                {course.studentsCount} Students
              </Typography>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2}>
            <Box display="flex" alignItems="center" gap={2}>
              {course.currentPrice !== null && course.currentPrice > 0 ? (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through", fontSize: "20px", fontWeight: "bold" }}
                  >
                    {formatCurrency(course.price)}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="error" 
                    sx={{ fontSize: "20px", fontWeight: "bold" }} 
                  >
                    {formatCurrency(course.currentPrice)}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "20px", fontWeight: "bold" }}
                  >
                    {/* {formatCurrency(course.price)} */} 
                    {/* Thành comment lại  */}
                  </Typography>
                  {/* <Typography 
                    variant="h6" 
                    color="success" 
                    sx={{ fontSize: "20px", fontWeight: "bold" }} 
                  >
                    Free
                  </Typography> */}
                </>
              )}
            </Box>

            <Button variant="contained" size="medium" sx={{ borderRadius: 3 }}>
              View More
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
