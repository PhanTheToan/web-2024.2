package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Category;
import web20242.webcourse.model.Course;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.PopularCategoryRepository;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private PopularCategoryRepository popularCategoryRepository;

    @Autowired
    private CourseRepository courseRepository;

    public ResponseEntity<?> addCategory(Category category) {
        try {
            popularCategoryRepository.save(category);
            return ResponseEntity.ok("Category added successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add category: " + e.getMessage());
        }
    }
    public ResponseEntity<?> updateCountByCategoryNameForSystem() {
        try {
            List<Category> categories = popularCategoryRepository.findAll();
            categories.forEach(category -> {
                AtomicReference<Integer> sumCountForCourse = new AtomicReference<>(0);
                ArrayList<Course> course = courseRepository.findByCategoriesIn(List.of(category.getCategory()));
                course.forEach(c -> {
                    sumCountForCourse.updateAndGet(v -> v + c.getStudentsEnrolled().size());
                });
                category.setCount(sumCountForCourse.get());
                popularCategoryRepository.save(category);
            });
            return ResponseEntity.ok("Done!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update count: " + e.getMessage());
        }
    }
    public ResponseEntity<?> updateInfor(Category category) {
        try {
            Category categoryUpdate = popularCategoryRepository.findByCategory(category.getCategory());
            if(categoryUpdate == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Category not found.");
            }else {
                categoryUpdate.setDisplayName(category.getDisplayName());
                return ResponseEntity.ok(popularCategoryRepository.save(categoryUpdate));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete popular category: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getPopularCategories() {
        List<Category> categories = popularCategoryRepository.findByStatus(true);
        List<Map<String, String>> result = categories.stream().map(category -> {
            Map<String, String> map = new HashMap<>();
            map.put("categoryId", category.getId().toHexString());
            map.put("categoryName", category.getCategory());
            map.put("categoryUrl", category.getUrlLogo());
            map.put("categoryCount",String.valueOf(category.getCount()));
            map.put("categoryDisplayName", category.getDisplayName());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<?> updateStatusCategories(String name){
        try {
            Category category = popularCategoryRepository.findByCategory(name);
            category.setStatus(!category.getStatus());
            popularCategoryRepository.save(category);
            return ResponseEntity.ok("Category updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update category: " + e.getMessage());
        }

    }

    public ResponseEntity<?> getFeaturedCategory() {
        List<Category> categories = popularCategoryRepository.findAll();
        List<Map<String, String>> result = categories.stream().map(category -> {
            Map<String, String> map = new HashMap<>();
            map.put("categoryId", category.getId().toHexString());
            map.put("categoryName", category.getCategory());
            map.put("categoryDisplayName", category.getDisplayName());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<?> deleteCategory(String id) {
        try {
            Optional<Category> category = popularCategoryRepository.findById(new ObjectId(id));
            if(category.isEmpty()){
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Category not found.");
            }
            popularCategoryRepository.delete(category.get());
            return ResponseEntity.ok("Category deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete category: " + e.getMessage());
        }
    }
}
