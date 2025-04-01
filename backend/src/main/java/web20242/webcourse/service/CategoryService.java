package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Category;
import web20242.webcourse.repository.PopularCategoryRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private PopularCategoryRepository popularCategoryRepository;

    public ResponseEntity<?> addCategory(Category category) {
        try {
            popularCategoryRepository.save(category);
            return ResponseEntity.ok("Category added successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add category: " + e.getMessage());
        }
    }

    public ResponseEntity<?> deletePopularCategory() {
        try {
            List<Category> category = popularCategoryRepository.findAll();
            if (category.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Popular category not found.");
            }else {
                category.forEach(category1 -> {
                    category1.setStatus(false);
                    popularCategoryRepository.save(category1);
                });
            }
            return ResponseEntity.ok("Popular category deleted successfully.");
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
