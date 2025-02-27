package web20242.webcourse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.service.EnrollmentService;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<Enrollment> createEnrollment(@RequestBody Enrollment enrollment) {
        Enrollment savedEnrollment = enrollmentService.createEnrollment(
                enrollment.getUserId().toHexString(),
                enrollment.getCourseId().toHexString(),
                enrollment.getProgress(),
                enrollment.getStatus(),
                enrollment.getScore(),
                enrollment.getCompletedAt()
        );
        return ResponseEntity.ok(savedEnrollment);
    }


}
