package web20242.webcourse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.service.CourseService;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoriesController {
    @Autowired
    private CourseService courseService;

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedCategories() {
        return ResponseEntity.ok(courseService.getFeaturedCategories());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/popular")
    public ResponseEntity<?> updatePopularCategories(@RequestBody List<String> ids) {
        return ResponseEntity.ok(courseService.updatePopularCategories(ids));
    }
}
