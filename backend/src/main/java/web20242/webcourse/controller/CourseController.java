package web20242.webcourse.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.Course;
import web20242.webcourse.service.CourseService;
import web20242.webcourse.service.UserService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/course")
public class CourseController {
    @Autowired
    private UserService userService;
    @Autowired
    private CourseService courseService;

    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/deleteUserCourse/{userId}/{courseId}")
    public ResponseEntity<?> deleteUserLeaveCourse(@PathVariable String userId, @PathVariable String courseId) {
        userService.deleteUserLeaveCourse(userId, courseId);
        return ResponseEntity.ok("User removed from course successfully");
    }
    @GetMapping
    public ResponseEntity<?> getAllCoursesForLandingPages() {
        return ResponseEntity.ok(courseService.getAllCoursesForLandingPage());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllCourse() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }
//    @PutMapping("/cleanup-invalid-categories")
//    public ResponseEntity<?> cleanupInvalidCategories() {
//        return courseService.updateCategoryNames();
//    }
}
