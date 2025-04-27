package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.UserRepository;
import web20242.webcourse.service.EnrollmentService;
import web20242.webcourse.service.UserService;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
    @Autowired
    private EnrollmentService enrollmentService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping()
    public ResponseEntity<?> getAllEnrollments(Principal principal) {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments(principal));
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/{courseId}")
    public ResponseEntity<?> enrollCourse(@PathVariable String courseId, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()){
            User user = userOptional.get();
            Course course = courseRepository.findById(new ObjectId(courseId)).orElse(null);
            assert course != null;
            ArrayList<String> categoryList = course.getCategories();
            if(categoryList.contains("PRIVATE")){
                return ResponseEntity.status(401).body("User not authenticate");
            }
            enrollmentService.createEnrollment(user.getId(), courseId);
            return ResponseEntity.ok("Enrolled successfully");
        }
        else  return ResponseEntity.status(401).body("User not found");

    }
    @PreAuthorize("hasRole('ROLE_USER')")
    @PutMapping("/{courseId}")
    public ResponseEntity<?> enrollCourseByRequest(@PathVariable String courseId, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()){
            enrollmentService.createEnrollmentByRequest(userOptional.get(), courseId);
            return ResponseEntity.ok("Enrolled successfully");
        }
        else  return ResponseEntity.status(401).body("User not found");

    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all-request-user")
    public ResponseEntity<?> getAllEnrollmentRequestUser(Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()){
            User user = userOptional.get();
            return ResponseEntity.ok(enrollmentService.getAllRequestForUser(user));
        }
        else  return ResponseEntity.status(401).body("User not found");
    }

    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @GetMapping("/all-request/{id}")
    public ResponseEntity<?> getAllEnrollmentRequest(@PathVariable String id) {
        return ResponseEntity.ok(enrollmentService.allRequestEnrolled(id));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/admin/accept")
    public ResponseEntity<?> acceptEnrollmentForAdmin(@RequestParam String email,
                                                      @RequestParam String courseId) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            enrollmentService.acceptEnrollmentRequestForAdmin(courseId,userOptional.get());
            return ResponseEntity.ok("Accepted successfully");
        }
        return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PutMapping("/teacher/accept")
    public ResponseEntity<?> acceptEnrollmentForTeacher(@RequestParam String email,
                                                      @RequestParam String courseId,
                                                        Principal principal) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            enrollmentService.acceptEnrollmentRequestForTeacher(courseId,userOptional.get(), principal);
            return ResponseEntity.ok("Accepted successfully");
        }
        return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PutMapping("/teacher/reject")
    public ResponseEntity<?> rejectEnrollmentForTeacher(@RequestParam String email,
                                                        @RequestParam String courseId,
                                                        Principal principal) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            enrollmentService.rejectEnrollmentRequestForTeacher(courseId,userOptional.get(), principal);
            return ResponseEntity.ok("Rejected successfully");
        }
        return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/admin/reject")
    public ResponseEntity<?> rejectEnrollmentForAdmin(@RequestParam String email,
                                                        @RequestParam String courseId) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            enrollmentService.rejectEnrollmentRequestForAdmin(courseId,userOptional.get());
            return ResponseEntity.ok("Rejected successfully");
        }
        return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/admin/add")
    public ResponseEntity<?> addEnrollmentForAdmin(@RequestParam String email,
                                                      @RequestParam String courseId) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            enrollmentService.addUserEnrolledForAdmin(courseId,userOptional.get());
            return ResponseEntity.ok("Added successfully");
        }
        return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PutMapping("/teacher/add")
    public ResponseEntity<?> addEnrollmentForTeacher(@RequestParam String email,
                                                   @RequestParam String courseId,
                                                     Principal principal) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            enrollmentService.addUserEnrolledForTeacher(courseId,userOptional.get(), principal);
            return ResponseEntity.ok("Added successfully");
        }
        return ResponseEntity.status(401).body("User not found");
    }




    @PreAuthorize("hasRole('ROLE_USER')")
    @PutMapping("/update-progress")
    public ResponseEntity<?> updateProgress(@RequestParam String courseId, @RequestParam String itemId, Principal principal) {
        return ResponseEntity.ok(enrollmentService.updateProgressForLesson(courseId, itemId, principal));
    }
    @PreAuthorize("hasRole('ROLE_USER')")
    @PutMapping("/update-quiz-progress")
    public ResponseEntity<?> updateProgressQuiz(@RequestParam String courseId, @RequestParam String itemId, @RequestParam Double newScore, Principal principal) {
        return ResponseEntity.ok(enrollmentService.updateProgressForQuiz(courseId, itemId, newScore,principal));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> deleteEnrollmentForAdmin(@RequestParam String courseId, @RequestParam String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            enrollmentService.deleteEnrollment(courseId,userOptional.get());
            return ResponseEntity.ok("Deleted successfully");
        }
        return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @DeleteMapping("/teacher/delete")
    public ResponseEntity<?> deleteEnrollmentForTeacher(@RequestParam String courseId, @RequestParam String email, Principal principal) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        User userTeacher = userRepository.findByUsername(principal.getName()).orElse(null);
        Course course = courseRepository.findById(new ObjectId(courseId)).orElse(null);
        if(userOptional.isPresent()) {
            assert course != null;
            assert userTeacher != null;
            if (course.getTeacherId().equals(userTeacher.getId())) {
                enrollmentService.deleteEnrollment(courseId, userOptional.get());
                return ResponseEntity.ok("Deleted successfully");
            }
        }
        return ResponseEntity.status(401).body("User not found");
    }

//    @PreAuthorize("hasRole('ROLE_USER')")
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteEnrollment(@PathVariable String id, Principal principal) {
//        return ResponseEntity.ok(enrollmentService.deleteEnrollment(id, principal));
//    }



}
