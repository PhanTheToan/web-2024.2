package web20242.webcourse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.service.UpdateService;

@RestController
@RequestMapping("/api/update")
public class UpdateController {
    private final UpdateService quizMigrationService;

    public UpdateController(UpdateService quizMigrationService) {
        this.quizMigrationService = quizMigrationService;
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/migrate")
    public ResponseEntity<String> migrateQuizzes() {
        try {
            quizMigrationService.migrateQuizzes();
            return new ResponseEntity<>("Migration completed successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Migration failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return new ResponseEntity<>("Pong", HttpStatus.OK);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update-course-enroll")
    public ResponseEntity<?> update_course(){
        return ResponseEntity.ok(quizMigrationService.update_course_enroll());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/timelimit")
    public void updateTimelimit(){
        quizMigrationService.update_time();
    }



}
