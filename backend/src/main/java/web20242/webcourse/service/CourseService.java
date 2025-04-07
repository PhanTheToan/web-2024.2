package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.*;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.*;
import org.springframework.data.mongodb.core.MongoTemplate;


import java.awt.print.Pageable;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CourseService {
    @Autowired
    private UserService userService;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private QuizzesRepository quizzesRepository;
    @Autowired
    private MongoTemplate mongoTemplate;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private PopularCategoryRepository popularCategoryRepository;
    //@Scheduled(fixedDelay = 86400000)
//    public void updateRatingsDaily() {
//        updateCourseRatings();
//    }
    public ResponseEntity<?> getAllCoursesForLandingPage() {
        List<Course> allCourses = courseRepository.findAll();
        List<Map<String, Object>> courseOverviews = allCourses.stream()
                .filter(course -> EStatus.ACTIVE.equals(course.getStatus())) // Filter by ACTIVE status
                .map(course -> {
                    Map<String, Object> overview = new HashMap<>();
                    overview.put("id", String.valueOf(course.getId()));
                    overview.put("title", course.getTitle());

                    Optional<User> userTeachers = userService.findById(String.valueOf(course.getTeacherId()));
                    if(userTeachers.isEmpty()){
                        String firstName = "Unknown";
                        String lastName = "Teacher";
                        overview.put("teacherFullName", (firstName + " " + lastName));
                    } else {
                        User userTeacher = userTeachers.get();
                        String firstName = userTeacher.getFirstName();
                        String lastName = userTeacher.getLastName();
                        overview.put("teacherFullName", (firstName + " " + lastName));
                    }
                    overview.put("teacherId", String.valueOf(course.getTeacherId()));
                    overview.put("description", course.getDescription());
                    overview.put("categories", course.getCategories());
                    overview.put("thumbnail", course.getThumbnail());
                    overview.put("price", course.getPrice());
                    overview.put("studentsCount", course.getStudentsEnrolled() != null ?
                            course.getStudentsEnrolled().size() : 0);
                    overview.put("contentCount",
                            (course.getLessons() != null ? course.getLessons().size() : 0));
                    overview.put("totalTimeLimit", course.getTotalTimeLimit());
                    return overview;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(courseOverviews);
    }

    public ResponseEntity<?> getFeaturedCategories() {
       List<Course> allCourses = courseRepository.findByCategoriesIn(List.of("POPULAR"));
        List<Map<String, Object>> courseOverviews = allCourses.stream()
                .map(course -> {
                    Map<String, Object> overview = new HashMap<>();
                    overview.put("id", String.valueOf(course.getId()));
                    overview.put("title", course.getTitle());

                    Optional<User> userTeachers = userService.findById(String.valueOf(course.getTeacherId()));
                    if(userTeachers.isEmpty()){
                        String firstName = "Unknown";
                        String lastName = "Teacher";
                        overview.put("teacherFullName", (firstName +" "+ lastName));
                    }else{
                        User userTeacher = userTeachers.get();
                        String firstName = userTeacher.getFirstName();
                        String lastName = userTeacher.getLastName();
                        overview.put("teacherFullName", (firstName +" "+ lastName));
                    }
                    overview.put("thumbnail", course.getThumbnail());
                    overview.put("categories", course.getCategories());
                    overview.put("price", course.getPrice());
                    overview.put("studentsCount", course.getStudentsEnrolled() != null ?
                            course.getStudentsEnrolled().size() : 0);
                    overview.put("contentCount",
                            (course.getLessons() != null ? course.getLessons().size() : 0));
                    overview.put("totalTimeLimit", course.getTotalTimeLimit());
                    return overview;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(courseOverviews);
    }
    public ResponseEntity<?> updateTimeLimit() {
        List<Course> courses = courseRepository.findAll();
        List<Lesson> lessons = lessonRepository.findAll();
        List<Quizzes> quizzes = quizzesRepository.findAll();
        for (Lesson lesson : lessons) {
            Integer randomInt = (int) (Math.random() * 100);
            lesson.setTimeLimit(randomInt);
            lessonRepository.save(lesson);
        }
        for (Quizzes quiz : quizzes) {
            Integer randomInt = (int) (Math.random() * 100);
            quiz.setTimeLimit(randomInt);
            quizzesRepository.save(quiz);
        }
        for (Course course : courses) {
            int totalTimeLimit = 0;
            if (course.getLessons() != null && !course.getLessons().isEmpty()) {
                for (ObjectId id : course.getLessons()) {
                    Lesson lesson = lessonRepository.findById(id).orElse(null);
                    if (lesson != null && lesson.getTimeLimit() != null) {
                        totalTimeLimit += lesson.getTimeLimit();
                    }
                }
            }
            if (course.getQuizzes() != null && !course.getQuizzes().isEmpty()) {
                for (ObjectId id : course.getQuizzes()) {
                    Quizzes quiz = quizzesRepository.findById(id).orElse(null);
                    if (quiz != null && quiz.getTimeLimit() != null) {
                        totalTimeLimit += quiz.getTimeLimit();
                    }
                }
            }
            course.setTotalTimeLimit(totalTimeLimit);
            courseRepository.save(course);
        }
        return ResponseEntity.ok("Done !");
    }

    public ResponseEntity<?> updatePopularCategories(List<String> ids) {
        List<Map<String, Object>> results = new ArrayList<>();

        for (String id : ids) {
            Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
            if (courseOptional.isEmpty()) {
                results.add(Map.of("id", id, "status", "Course not found"));
            } else {
                String popularId = "POPULAR";
                Course course = courseOptional.get();
                ArrayList<String> categories = course.getCategories();
                if (categories.contains(popularId)) {
                    categories.remove(popularId);
                } else {
                    categories.add(popularId);
                }
                course.setCategories(categories);
                course.setUpdatedAt(LocalDateTime.now());
                courseRepository.save(course);
                results.add(Map.of("id", id, "status", "Successfully updated"));
            }
        }
        return ResponseEntity.ok(results);
    }
//    public ResponseEntity<?> getFilteredCourses(CourseFilterRequest filterRequest) {
//        double minPrice = 0;
//        double maxPrice = Double.MAX_VALUE;
//
//        if (filterRequest.getPriceFilter() != null) {
//            if ("Free".equalsIgnoreCase(filterRequest.getPriceFilter())) {
//                maxPrice = 0;
//            } else if ("Paid".equalsIgnoreCase(filterRequest.getPriceFilter())) {
//                minPrice = 0.01;
//            }
//        }
//
//        List<String> categories = (filterRequest.getCategories() != null && !filterRequest.getCategories().isEmpty())
//                ? filterRequest.getCategories().stream()
//                .map(Enum::name)
//                .collect(Collectors.toList())
//                : Collections.emptyList();
//
//        List<ObjectId> teacherIds = (filterRequest.getTeacherIds() != null && !filterRequest.getTeacherIds().isEmpty())
//                ? filterRequest.getTeacherIds().stream()
//                .map(idStr -> {
//                    try {
//                        return new ObjectId(idStr);
//                    } catch (Exception e) {
//                        return null;
//                    }
//                })
//                .filter(Objects::nonNull)
//                .collect(Collectors.toList())
//                : Collections.emptyList();
//
//        List<Double> ratings = (filterRequest.getRatings() != null && !filterRequest.getRatings().isEmpty())
//                ? filterRequest.getRatings()
//                : Collections.emptyList();
//
//        List<Course> courses = courseRepository.findByFilters(
//                categories.isEmpty() ? null : categories,
//                ratings.isEmpty() ? null : ratings,
//                teacherIds.isEmpty() ? null : teacherIds,
//                minPrice,
//                maxPrice
//        );
//
//        // Map courses to overview information only
//        List<Map<String, Object>> courseOverviews = courses.stream().map(course -> {
//            Map<String, Object> overview = new HashMap<>();
//            overview.put("id", String.valueOf(course.getId()));
//            overview.put("title", course.getTitle());
//
//            User userTeacher = userService.findById(String.valueOf(course.getTeacherId()));
//            if (userTeacher == null) {
//                overview.put("teacherFullName", "Unknown Teacher");
//            } else {
//                String fullName = userTeacher.getFirstName() + " " + userTeacher.getLastName();
//                overview.put("teacherFullName", fullName);
//            }
//
//            overview.put("thumbnail", course.getThumbnail());
//            overview.put("categories", course.getCategories());
//            overview.put("price", course.getPrice());
//            overview.put("studentsCount", course.getStudentsEnrolled() != null ? course.getStudentsEnrolled().size() : 0);
//
//            int contentCount = (course.getLessons() != null ? course.getLessons().size() : 0) +
//                    (course.getQuizzes() != null ? course.getQuizzes().size() : 0);
//            overview.put("contentCount", contentCount);
//
//            int totalTimeLimit = 0;
//            if (course.getLessons() != null && !course.getLessons().isEmpty()) {
//                for (ObjectId lessonId : course.getLessons()) {
//                    Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
//                    if (lesson != null && lesson.getTimeLimit() != null) {
//                        totalTimeLimit += lesson.getTimeLimit();
//                    }
//                }
//            }
//            if (course.getQuizzes() != null && !course.getQuizzes().isEmpty()) {
//                for (ObjectId quizId : course.getQuizzes()) {
//                    Quizzes quiz = quizzesRepository.findById(quizId).orElse(null);
//                    if (quiz != null && quiz.getTimeLimit() != null) {
//                        totalTimeLimit += quiz.getTimeLimit();
//                    }
//                }
//            }
//            overview.put("totalTimeLimit", totalTimeLimit);
//            return overview;
//        }).collect(Collectors.toList());
//
//        return ResponseEntity.ok(courseOverviews);
//    }


    private void updateCourseRatings() {
        List<Course> allCourses = courseRepository.findAll();
        for (Course course : allCourses) {
            Double avgRating = calculateAverageRating(course.getId());
            course.setAverageRating(avgRating);
            courseRepository.save(course);
        }
    }

    private Double calculateAverageRating(ObjectId courseId) {
        List<Review> reviews = reviewRepository.findByCourseId(courseId);

        if (reviews.isEmpty()) {
            return null;
        }

        double sum = 0;
        for (Review review : reviews) {
            sum += review.getRating();
        }

        return Math.round(sum / reviews.size() * 2) / 2.0; // rounding to nearest 0.5
    }

    public ResponseEntity<List<Map<String, Object>>> getAllCoursesForAdmin() {
        List<Course> allCourses = courseRepository.findAll();
        List<Map<String, Object>> courseOverviews = allCourses.stream()
                .map(course -> {
                    Map<String, Object> overview = new HashMap<>();
                    overview.put("id", String.valueOf(course.getId()));
                    overview.put("title", course.getTitle());

                    Optional<User> userTeachers = userService.findById(String.valueOf(course.getTeacherId()));
                    if(userTeachers.isEmpty()){
                        String firstName = "Unknown";
                        String lastName = "Teacher";
                        overview.put("teacherFullName", (firstName +" "+ lastName));
                        overview.put("teacherID", null);
                    }else{
                        User userTeacher = userTeachers.get();
                        String firstName = userTeacher.getFirstName();
                        String lastName = userTeacher.getLastName();
                        overview.put("teacherFullName", (firstName +" "+ lastName));
                        overview.put("teacherId", String.valueOf(course.getTeacherId()));
                    }
                    overview.put("courseStatus", course.getStatus());
                    overview.put("thumbnail", course.getThumbnail());
                    overview.put("categories", course.getCategories());
                    overview.put("price", course.getPrice());
                    overview.put("studentsCount", course.getStudentsEnrolled() != null ?
                            course.getStudentsEnrolled().size() : 0);
                    overview.put("contentCount",
                            (course.getLessons() != null ? course.getLessons().size() : 0));
                    overview.put("totalTimeLimit", course.getTotalTimeLimit());
                    return overview;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(courseOverviews);
    }
    public ResponseEntity<List<Map<String, Object>>> getAllCoursesForTeacher(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User user = userService.findByUsername(principal.getName());

        List<Course> allCourses = courseRepository.findAll();

        List<Map<String, Object>> courseOverviews = allCourses.stream()
                .filter(course -> course.getTeacherId().equals(user.getId()))
                .map(course -> {
                    Map<String, Object> overview = new HashMap<>();
                    overview.put("id", String.valueOf(course.getId()));
                    overview.put("title", course.getTitle());

                    Optional<User> userTeachers = userService.findById(String.valueOf(course.getTeacherId()));
                    if (userTeachers.isEmpty()) {
                        String firstName = "Unknown";
                        String lastName = "Teacher";
                        overview.put("teacherFullName", (firstName + " " + lastName));
                        overview.put("teacherID", null);
                    } else {
                        User userTeacher = userTeachers.get();
                        String firstName = userTeacher.getFirstName();
                        String lastName = userTeacher.getLastName();
                        overview.put("teacherFullName", (firstName + " " + lastName));
                        overview.put("teacherId", String.valueOf(course.getTeacherId()));
                    }

                    overview.put("courseStatus", course.getStatus());
                    overview.put("thumbnail", course.getThumbnail());
                    overview.put("categories", course.getCategories());
                    overview.put("price", course.getPrice());
                    overview.put("studentsCount", course.getStudentsEnrolled() != null ?
                            course.getStudentsEnrolled().size() : 0);
                    overview.put("contentCount",
                            (course.getLessons() != null ? course.getLessons().size() : 0));
                    overview.put("totalTimeLimit", course.getTotalTimeLimit());
                    return overview;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(courseOverviews);
    }

    public ResponseEntity<?> updateStatus() {
       List<Course> courses = courseRepository.findAll();
        for (Course course : courses) {
            if (course.getStatus() == null) {
                course.setStatus(EStatus.ACTIVE);
            } else if (course.getStatus().equals(EStatus.ACTIVE)) {
                course.setStatus(EStatus.INACTIVE);
            } else {
                course.setStatus(EStatus.ACTIVE);
            }
            course.setUpdatedAt(LocalDateTime.now());
            courseRepository.save(course);
        }
        return ResponseEntity.ok("Done !");
    }
    public ResponseEntity<?> updateStatusForAdmin(String id){
       Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            if (course.getStatus() == null) {
                course.setStatus(EStatus.ACTIVE);
            } else if (course.getStatus().equals(EStatus.ACTIVE)) {
                course.setStatus(EStatus.INACTIVE);
            } else {
                course.setStatus(EStatus.ACTIVE);
            }
            course.setUpdatedAt(LocalDateTime.now());
            courseRepository.save(course);
            return ResponseEntity.ok("Done !");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }
    public ResponseEntity<?> updateStatusForTeacher(String id, Principal principal){
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        if(principal == null){
            return  ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        User user = userService.findByUsername(principal.getName());
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            if(Objects.equals(course.getTeacherId(), user.getId())){
                course.setStatus(course.getStatus() == null || course.getStatus().equals(EStatus.INACTIVE)
                        ? EStatus.ACTIVE
                        : EStatus.INACTIVE);
                course.setUpdatedAt(LocalDateTime.now());
                courseRepository.save(course);
                return ResponseEntity.ok("Done !");
            }else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this course");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }

    public ResponseEntity<?> test(Principal principal) {
         User user = userService.findByUsername(principal.getName());
         if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
         }
        Map<String, Object> overview = new HashMap<>();
        overview.put("id", String.valueOf(user.getId()));
        overview.put("username", user.getUsername());
        overview.put("firstName", user.getFirstName());
        overview.put("lastName", user.getLastName());
         return ResponseEntity.ok(overview);
    }

    public ResponseEntity<?> setOwner(String courseId, String userId) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            course.setTeacherId(new ObjectId(userId));
            course.setUpdatedAt(LocalDateTime.now());
            courseRepository.save(course);
            return ResponseEntity.ok("Done !");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }


//    public ResponseEntity<?> getCoursesByPage(int page) {
//        int pageSize = 6;
//        Pageable pageable = PageRequest.of(page, pageSize);
//        Page<Course> coursePage = courseRepository.findAll(pageable);
//        List<Course> courses = coursePage.getContent();
//        List<Map<String, Object>> courseOverviews = courses.stream()
//                .map(course -> {
//                    Map<String, Object> overview = new HashMap<>();
//                    overview.put("id", String.valueOf(course.getId()));
//                    overview.put("title", course.getTitle());
//
//                    User userTeacher = userService.findById(String.valueOf(course.getTeacherId()));
//                    if (userTeacher == null) {
//                        String firstName = "Unknown";
//                        String lastName = "Teacher";
//                        overview.put("teacherFullName", (firstName + " " + lastName));
//                    } else {
//                        String firstName = userTeacher.getFirstName();
//                        String lastName = userTeacher.getLastName();
//                        overview.put("teacherFullName", (firstName + " " + lastName));
//                    }
//                    overview.put("thumbnail", course.getThumbnail());
//                    overview.put("categories", course.getCategories());
//                    overview.put("price", course.getPrice());
//                    overview.put("studentsCount", course.getStudentsEnrolled() != null ?
//                            course.getStudentsEnrolled().size() : 0);
//                    overview.put("contentCount",
//                            (course.getLessons() != null ? course.getLessons().size() : 0));
//                    overview.put("totalTimeLimit", course.getTotalTimeLimit());
//                    return overview;
//                })
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(courseOverviews);
//    }


//    public ResponseEntity<?> updateCategoryNames() {
//        try {
//            long totalUpdated = 0;
//
//            // Cập nhật "FINANCE & ACCOUNTING" thành "FINANCE"
//            Query financeQuery = new Query(Criteria.where("categories").is("FINANCE & ACCOUNTING"));
//            Update financeUpdate = new Update().set("categories.$", ECategory.FINANCE.name());
//            UpdateResult financeResult = mongoTemplate.updateMulti(financeQuery, financeUpdate, "courses");
//            totalUpdated += financeResult.getModifiedCount();
//
//            // Cập nhật "IT & SOFTWARE" thành "IT"
//            Query itQuery = new Query(Criteria.where("categories").is("IT & SOFTWARE"));
//            Update itUpdate = new Update().set("categories.$", ECategory.IT.name());
//            UpdateResult itResult = mongoTemplate.updateMulti(itQuery, itUpdate, "courses");
//            totalUpdated += itResult.getModifiedCount();
//
//            // Cập nhật "PHOTOGRAPHY & VIDEO" thành "PHOTOGRAPHY"
//            Query photoQuery = new Query(Criteria.where("categories").is("PHOTOGRAPHY & VIDEO"));
//            Update photoUpdate = new Update().set("categories.$", ECategory.PHOTOGRAPHY.name());
//            UpdateResult photoResult = mongoTemplate.updateMulti(photoQuery, photoUpdate, "courses");
//            totalUpdated += photoResult.getModifiedCount();
//
//            return ResponseEntity.ok(Map.of(
//                    "message", "Successfully updated category names",
//                    "updatedCount", totalUpdated,
//                    "details", Map.of(
//                            "FINANCE & ACCOUNTING", financeResult.getModifiedCount(),
//                            "IT & SOFTWARE", itResult.getModifiedCount(),
//                            "PHOTOGRAPHY & VIDEO", photoResult.getModifiedCount()
//                    )
//            ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", e.getMessage()));
//        }
//    }
}
