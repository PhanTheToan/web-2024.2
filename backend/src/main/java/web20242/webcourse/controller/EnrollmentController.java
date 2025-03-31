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

    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/{courseId}")
    public ResponseEntity<?> enrollCourse(@PathVariable String courseId, Principal principal) {
        User user = userService.findByUsername(principal.getName());
        enrollmentService.createEnrollment(user.getId(), courseId, 0.0, EStatus.NOTSTARTED, null);
        return ResponseEntity.ok("Enrolled successfully");
    }



}
