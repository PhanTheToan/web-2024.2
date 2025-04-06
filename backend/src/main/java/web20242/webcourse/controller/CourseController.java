package web20242.webcourse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.CourseFilterRequest;
import web20242.webcourse.service.CourseService;
import web20242.webcourse.service.UserService;

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

    @PutMapping("/update/timelimit")
    public ResponseEntity<?> updateTimelimits(){
        return ResponseEntity.ok(courseService.updateTimeLimit());
    }

//    @PostMapping("/filter")
//    public ResponseEntity<?> getFilteredCourses(@RequestBody CourseFilterRequest filterRequest) {
//        return courseService.getFilteredCourses(filterRequest);
//    }
//    @GetMapping("/updateRatings")
//    public void updateRating(){
//        courseService.updateRatingsDaily();
//    }

    @GetMapping("/all")
    public ResponseEntity<?> getAlls() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }
//    @PutMapping("/cleanup-invalid-categories")
//    public ResponseEntity<?> cleanupInvalidCategories() {
//        return courseService.updateCategoryNames();
//    }
//    @GetMapping("/page/{page}")
//    public ResponseEntity<?> getCoursesByPage(@PathVariable int page) {
//        return ResponseEntity.ok(courseService.getCoursesByPage(page));
//    }
}
