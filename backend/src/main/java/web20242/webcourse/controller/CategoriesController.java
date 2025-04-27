package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.Category;
import web20242.webcourse.service.CourseService;
import web20242.webcourse.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoriesController {
    @Autowired
    private CourseService courseService;

    @Autowired
    private CategoryService popularCategoryService;

    @GetMapping("/featured-courses")
    public ResponseEntity<?> getFeaturedCategories() {
        return ResponseEntity.ok(courseService.getFeaturedCategories());
    }

    @GetMapping("/featured-category")
    public ResponseEntity<?> getFeaturedCategory() {
        return ResponseEntity.ok(popularCategoryService.getFeaturedCategory());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllCategory() {
        return ResponseEntity.ok(popularCategoryService.getAllCategory());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/featured-course")
    public ResponseEntity<?> updatePopularCategories(@RequestBody List<String> ids) {
        return ResponseEntity.ok(courseService.updatePopularCategories(ids));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/featured")
    public ResponseEntity<?> addPopularCategory(@RequestBody Category popularCategory) {
        return ResponseEntity.ok((popularCategoryService.addCategory(popularCategory)));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update-info/{id}")
    public ResponseEntity<?> updateInformationCategory(@PathVariable String id, @RequestBody Category category){
        category.setId(new ObjectId(id));
        return ResponseEntity.ok(popularCategoryService.updateInfor(category));
    }

//
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/update-infor")
//    public ResponseEntity<?> changStatus(@RequestBody Category category) {
//        return ResponseEntity.ok(popularCategoryService.updateInfor(category));
//    }
//
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/update-count")
//    public ResponseEntity<?> updateCountByCategoryNameForSystem() {
//        return ResponseEntity.ok(popularCategoryService.updateCountByCategoryNameForSystem());
//    }

    @GetMapping("/popular")
    public ResponseEntity<?> getPopularCategories() {
        return ResponseEntity.ok(popularCategoryService.getPopularCategories());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update/{name}")
    public ResponseEntity<?> updateStatusCategory(@PathVariable String name) {
        return ResponseEntity.ok(popularCategoryService.updateStatusCategories(name));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id){
        return ResponseEntity.ok(popularCategoryService.deleteCategory(id));
    }
}
