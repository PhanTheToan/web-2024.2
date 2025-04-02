"use client";

import { Card, CardContent, CardMedia, Typography, Box, Chip, Avatar, Button } from "@mui/material";
import { Star, People } from "@mui/icons-material";
import { Clock, Users } from "lucide-react";

interface Course {
    id: number;
    title: string;
    instructor: string;
    category: string;
    duration?: string;
    students: number;
    originalPrice: number;
    currentPrice: number | null;
    isFree: boolean;
    imageUrl: string;
  }

interface CourseGridProps {
    courses: Course[]; // Bắt buộc phải có courses, không dùng defaultCourses nữa
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
        <Card sx={{ 
            overflow: "hidden", 
            display: "flex", 
            flexDirection: "column", 
            minHeight: 470, 
            borderRadius: 4, 
            backgroundColor: "#fff",
            transition: "0.3s",
            '&:hover': {
              transform: "scale(1.03)",
              boxShadow: 3
            }
          }}>
        <Box sx={{ position: "relative" }}>
          <Chip label={course.category} sx={{ position: "absolute", top: 16, left: 16, backgroundColor: "black", color: "white" }} />
          <CardMedia sx={{ height: 250 }} image={course.imageUrl} title={course.title} />
        </Box>
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>by {course.instructor}</Typography>
          <Typography variant="h6" fontWeight="bold" mb={2}>{course.title}</Typography>
          <Box display="flex" alignItems="center" gap={2} mt="auto">
            <Box display="flex" alignItems="center" gap={1}>
              <Clock className="h-5 w-5 text-orange-500" />
              <Typography variant="body2" fontWeight={600} fontSize={18}>{course.duration}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Users className="h-5 w-5 text-orange-500" />
              <Typography variant="body2" fontWeight={600} fontSize={18}>{course.students} Students</Typography>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2}>
            <Box display="flex" alignItems="center" gap={2}>
              {course.currentPrice !== null ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>${course.originalPrice.toFixed(1)}</Typography>
                  <Typography variant="h6" color="error" fontWeight="bold">${course.currentPrice.toFixed(1)}</Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>${course.originalPrice.toFixed(1)}</Typography>
                  <Typography variant="h6" color="success" fontWeight="bold">Free</Typography>
                </>
              )}
            </Box>
            <Button variant="contained" size="medium" sx={{ borderRadius: 3 }}>View More</Button>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  