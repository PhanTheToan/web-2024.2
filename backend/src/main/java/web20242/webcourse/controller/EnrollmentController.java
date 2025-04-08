package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.UserRepository;
import web20242.webcourse.service.EnrollmentService;
import web20242.webcourse.service.UserService;

import java.security.Principal;
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
            enrollmentService.createEnrollment(user.getId(), courseId);
            return ResponseEntity.ok("Enrolled successfully");
        }
        else  return ResponseEntity.status(401).body("User not found");

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
//    @PreAuthorize("hasRole('ROLE_USER')")
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteEnrollment(@PathVariable String id, Principal principal) {
//        return ResponseEntity.ok(enrollmentService.deleteEnrollment(id, principal));
//    }



}
