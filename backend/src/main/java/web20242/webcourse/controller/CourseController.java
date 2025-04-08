package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.CourseFilterRequest;
import web20242.webcourse.service.CourseService;
import web20242.webcourse.service.UserService;

import java.security.Principal;
import java.util.Map;

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

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/complete-course")
    public ResponseEntity<?> getCourseCompleteForUser(Principal principal) {
        return ResponseEntity.ok(courseService.getAllCoursesComplete(principal));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/lessonandquiz/{id}")
    public ResponseEntity<?> getLessonAndQuiz(@PathVariable String id){
        return ResponseEntity.ok(courseService.getLessonAndQuizForCourse(id));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PutMapping("/update-order")
    public ResponseEntity<?> updateOrder(
            @RequestParam String itemType,
            @RequestParam String itemId,
            @RequestParam Integer newOrder,
            Principal principal) {
        return ResponseEntity.ok(courseService.updateOrderForItem(itemType, new ObjectId(itemId), newOrder, principal));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @GetMapping("/getlessonquiz/{id}")
    public ResponseEntity<?> getLessonAndQuizForCourse(@PathVariable String id, Principal principal){
        return ResponseEntity.ok(courseService.getLessonAndQuizForCourseTeacher(id, principal));
    }
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/update-order")
//    public ResponseEntity<?> updateOrder(){
//        return ResponseEntity.ok(courseService.updateOrder());
//    }

//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/update/admin/status")
//    public ResponseEntity<?> updateStatus(){
//        return ResponseEntity.ok(courseService.updateStatus());
//    }

    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PutMapping("/update/status/{id}")
    public ResponseEntity<?> updateStatusById(@PathVariable String id, Principal principal){
        return ResponseEntity.ok(courseService.updateStatusForTeacher(id, principal));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update/admin-status/{id}")
    public ResponseEntity<?> updateStatusByAdmin(@PathVariable String id){
        return ResponseEntity.ok(courseService.updateStatusForAdmin(id));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCourseForever(@PathVariable String id){
        return ResponseEntity.ok(courseService.deleteCourseForever(id));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/test")
    public ResponseEntity<?> test(Principal principal){
        return ResponseEntity.ok(courseService.test(principal));
    }
//    @PostMapping("/filter")
//    public ResponseEntity<?> getFilteredCourses(@RequestBody CourseFilterRequest filterRequest) {
//        return courseService.getFilteredCourses(filterRequest);
//    }
//    @GetMapping("/updateRatings")
//    public void updateRating(){
//        courseService.updateRatingsDaily();
//    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/set-owner")
    public ResponseEntity<?> setOwner(@RequestBody Map<String, String> data) {
        String courseId = data.get("courseId");
        String userId = data.get("userId");
        return ResponseEntity.ok(courseService.setOwner(courseId, userId));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAlls() {
        return ResponseEntity.ok(courseService.getAllCoursesForAdmin());
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @GetMapping("/all-teacher")
    public ResponseEntity<?> getAllsForTeacher(Principal principal) {
        return ResponseEntity.ok(courseService.getAllCoursesForTeacher(principal));
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
