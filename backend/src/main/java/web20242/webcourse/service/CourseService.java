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
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
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

    public ResponseEntity<?> deleteCourseForever(String id) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            courseRepository.delete(course);
            List<Lesson> lessonOptional = lessonRepository.findByCourseId(course.getId());
            List<Quizzes> quizzesList = quizzesRepository.findByCourseId(course.getId());
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
            List<Review> reviews = reviewRepository.findByCourseId(course.getId());
            List<User> students = userRepository.findByCoursesEnrolled(course.getId());
            for (Lesson lesson : lessonOptional) {
                lessonRepository.delete(lesson);
            }
            for( Quizzes quizzes : quizzesList) {
                quizzesRepository.delete(quizzes);
            }
            for (Enrollment enrollment : enrollments) {
                enrollmentRepository.delete(enrollment);
            }
            for( Review review : reviews) {
                reviewRepository.delete(review);
            }
            for(User user : students){
                user.getCoursesEnrolled().remove(course.getId());
            }
            return ResponseEntity.ok("Course deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }
    public ResponseEntity<?> getLessonAndQuizForCourse(String id){
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            List<Lesson> lessons = lessonRepository.findByCourseId(course.getId());
            List<Quizzes> quizzes = quizzesRepository.findByCourseId(course.getId());
            Map<String, Object> result = new HashMap<>();
            result.put("lessons", lessons);
            result.put("quizzes", quizzes);
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }

    public ResponseEntity<?> getAllCoursesComplete(Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
            List<Map<String, Object>> courseOverviews = enrollments.stream()
                    .filter(enrollment -> EStatus.DONE.equals(enrollment.getStatus()))
                    .map(enrollment -> {
                        Map<String, Object> overview = new HashMap<>();
                        Course course = courseRepository.findById(enrollment.getCourseId()).orElse(null);
                        if (course != null) {
                            overview.put("id", String.valueOf(course.getId()));
                            overview.put("title", course.getTitle());
                            overview.put("status", enrollment.getStatus());
                            overview.put("thumbnail", course.getThumbnail());
                            String teacherName;
                            Optional<User> userTeacher = userService.findById(String.valueOf(course.getTeacherId()));
                            teacherName = userTeacher.map(value -> value.getFirstName() + " " + value.getLastName())
                                    .orElse("Unknown Teacher");
                            overview.put("teacherName", teacherName);
                            overview.put("completeDate", enrollment.getCompletedAt());
                            return overview;
                        }
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(courseOverviews);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
    }
    public ResponseEntity<?> getAllCoursesInprocess(Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
            List<Map<String, Object>> courseOverviews = enrollments.stream()
                    .filter(enrollment -> EStatus.INPROGRESS.equals(enrollment.getStatus()))
                    .map(enrollment -> {
                        Map<String, Object> overview = new HashMap<>();
                        Course course = courseRepository.findById(enrollment.getCourseId()).orElse(null);
                        if (course != null) {
                            overview.put("id", String.valueOf(course.getId()));
                            overview.put("title", course.getTitle());
                            overview.put("status", enrollment.getStatus());
                            overview.put("thumbnail", course.getThumbnail());
                            String teacherName;
                            Optional<User> userTeacher = userService.findById(String.valueOf(course.getTeacherId()));
                            teacherName = userTeacher.map(value -> value.getFirstName() + " " + value.getLastName())
                                    .orElse("Unknown Teacher");
                            overview.put("teacherName", teacherName);
                            overview.put("process", enrollment.getProgress());
                            overview.put("timeCurrent", enrollment.getTimeCurrent());
                            overview.put("startDate", enrollment.getEnrolledAt());
                            return overview;
                        }
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(courseOverviews);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
    }

    public ResponseEntity<?> updateOrder() {
        List<Course> courseList = courseRepository.findAll();

        for (Course course : courseList) {
            List<Lesson> lessons = lessonRepository.findByCourseId(course.getId());
            List<Quizzes> quizzes = quizzesRepository.findByCourseId(course.getId());

            lessons.sort(Comparator.comparing(Lesson::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));
            quizzes.sort(Comparator.comparing(Quizzes::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));

            int lessonIndex = 0;
            int quizIndex = 0;
            int currentOrder = 1;

            while (lessonIndex < lessons.size() || quizIndex < quizzes.size()) {
                if (lessonIndex < lessons.size()) {
                    Lesson lesson = lessons.get(lessonIndex);
                    lesson.setOrder(currentOrder++);
                    lessonRepository.save(lesson);
                    lessonIndex++;
                }

                if (quizIndex < quizzes.size()) {
                    Quizzes quiz = quizzes.get(quizIndex);
                    quiz.setOrder(currentOrder++);
                    quizzesRepository.save(quiz);
                    quizIndex++;
                }
            }
        }

        return ResponseEntity.ok("Order updated successfully with interleaved lessons and quizzes!");
    }

    public ResponseEntity<?> updateOrderForItem(String itemType, ObjectId itemId, Integer newOrder, Principal principal) {
        ObjectId courseId;
        if ("LESSON".equalsIgnoreCase(itemType)) {
            Lesson lesson = lessonRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Lesson not found"));
            courseId = lesson.getCourseId();
        } else if ("QUIZ".equalsIgnoreCase(itemType)) {
            Quizzes quiz = quizzesRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Quiz not found"));
            courseId = quiz.getCourseId();
        } else {
            return ResponseEntity.badRequest().body("Invalid item type. Must be 'LESSON' or 'QUIZ'.");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()){
            User user = userOptional.get();
            if (!user.getId().equals(course.getTeacherId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this course");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        List<Lesson> lessons = lessonRepository.findByCourseId(courseId);
        List<Quizzes> quizzes = quizzesRepository.findByCourseId(courseId);

        List<OrderableItem> items = new ArrayList<>();
        for (Lesson lesson : lessons) {
            items.add(new OrderableItem("LESSON", lesson.getId(), lesson.getOrder(), lesson));
        }
        for (Quizzes quiz : quizzes) {
            items.add(new OrderableItem("QUIZ", quiz.getId(), quiz.getOrder(), quiz));
        }

        items.sort(Comparator.nullsLast(Comparator.comparingInt(OrderableItem::getOrder)));
        OrderableItem targetItem = items.stream()
                .filter(item -> item.getId().equals(itemId) && item.getType().equals(itemType))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in the list"));

        items.remove(targetItem);

        int insertIndex = 0;
        for (OrderableItem orderableItem : items) {
            if (orderableItem.getOrder() != null && orderableItem.getOrder() >= newOrder) {
                break;
            }
            insertIndex++;
        }

        targetItem.setOrder(newOrder);
        items.add(insertIndex, targetItem);

        int currentOrder = 1;
        for (OrderableItem item : items) {
            item.setOrder(currentOrder++);
        }
        for (OrderableItem item : items) {
            if ("LESSON".equals(item.getType())) {
                Lesson lesson = (Lesson) item.getEntity();
                lesson.setOrder(item.getOrder());
                lessonRepository.save(lesson);
            } else {
                Quizzes quiz = (Quizzes) item.getEntity();
                quiz.setOrder(item.getOrder());
                quizzesRepository.save(quiz);
            }
        }

        return ResponseEntity.ok("Order updated successfully with interleaved lessons and quizzes!");
    }

    public ResponseEntity<?> getLessonAndQuizForCourseTeacher(String id, Principal principal) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent() && courseOptional.isPresent()){
            User user = userOptional.get();
            Course course = courseOptional.get();
            if (!user.getId().equals(course.getTeacherId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this course");
            }
            else {
                List<Lesson> lessons = lessonRepository.findByCourseId(course.getId());
                List<Quizzes> quizzes = quizzesRepository.findByCourseId(course.getId());
                List<Map<String, Object>> lessonData = lessons.stream().map(lesson -> {
                    Map<String, Object> lessonMap = new HashMap<>();
                    lessonMap.put("lessonId", lesson.getId().toString());
                    lessonMap.put("lessonTitle", lesson.getTitle());
                    lessonMap.put("lessonShortTile",lesson.getShortTile());
                    lessonMap.put("orderLesson", lesson.getOrder());
                    return lessonMap;
                }).collect(Collectors.toList());

                List<Map<String, Object>> quizData = quizzes.stream().map(quiz -> {
                    Map<String, Object> quizMap = new HashMap<>();
                    quizMap.put("quizId", quiz.getId().toString());
                    quizMap.put("passingScore", quiz.getPassingScore());
                    quizMap.put("questionCount", quiz.getQuestions().size());
                    quizMap.put("orderQuiz", quiz.getOrder());
                    return quizMap;
                }).collect(Collectors.toList());

                Map<String, Object> result = new HashMap<>();
                result.put("lessons", lessonData);
                result.put("quizzes", quizData);


                return ResponseEntity.ok(result);
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
    }

    public ResponseEntity<?> getLessonAndQuizForCourseUser(ObjectId id, Principal principal) {
        Optional<Enrollment> enrollmentOptional = enrollmentRepository.findById(id);
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());

        if (userOptional.isPresent() && enrollmentOptional.isPresent()) {
            User user = userOptional.get();
            Enrollment enrollment = enrollmentOptional.get();

            if (!user.getId().equals(enrollment.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this course");
            }

            Optional<Course> courseOptional = courseRepository.findById(enrollment.getCourseId());
            if (courseOptional.isPresent()) {
                Course course = courseOptional.get();
                List<Lesson> lessons = lessonRepository.findByCourseId(course.getId());
                List<Quizzes> quizzes = quizzesRepository.findByCourseId(course.getId());

                // Get the list of completed IDs from enrollment, ensuring it's never null
                ArrayList<ObjectId> completedIds = new ArrayList<>();
                if (enrollment.getLessonAndQuizId() != null) {
                    completedIds.addAll(enrollment.getLessonAndQuizId());
                }

                // Process Lessons
                List<Map<String, Object>> learnedLessons = new ArrayList<>();
                List<Map<String, Object>> notLearnedLessons = new ArrayList<>();

                lessons.forEach(lesson -> {
                    Map<String, Object> lessonMap = new HashMap<>();
                    lessonMap.put("lessonId", lesson.getId().toString());
                    lessonMap.put("lessonTitle", lesson.getTitle());
                    lessonMap.put("lessonShortTile",lesson.getShortTile());
                    lessonMap.put("orderLesson", lesson.getOrder());

                    if (completedIds.contains(lesson.getId())) {
                        learnedLessons.add(lessonMap);
                    } else {
                        notLearnedLessons.add(lessonMap);
                    }
                });

                // Process Quizzes
                List<Map<String, Object>> learnedQuizzes = new ArrayList<>();
                List<Map<String, Object>> notLearnedQuizzes = new ArrayList<>();

                quizzes.forEach(quiz -> {
                    Map<String, Object> quizMap = new HashMap<>();
                    quizMap.put("quizId", quiz.getId().toString());
                    quizMap.put("passingScore", quiz.getPassingScore());
                    quizMap.put("questionCount", quiz.getQuestions().size());
                    quizMap.put("orderQuiz", quiz.getOrder());

                    if (completedIds.contains(quiz.getId())) {
                        learnedQuizzes.add(quizMap);
                    } else {
                        notLearnedQuizzes.add(quizMap);
                    }
                });

                // Sort all lists by order
                Comparator<Map<String, Object>> orderComparator = Comparator.comparingInt(m ->
                        (Integer) m.getOrDefault("orderLesson", m.getOrDefault("orderQuiz", 0)));

                learnedLessons.sort(orderComparator);
                notLearnedLessons.sort(orderComparator);
                learnedQuizzes.sort(orderComparator);
                notLearnedQuizzes.sort(orderComparator);

                // Prepare response
                Map<String, Object> result = new HashMap<>();
                Map<String, Object> learned = new HashMap<>();
                Map<String, Object> notLearned = new HashMap<>();

                learned.put("lessons", learnedLessons);
                learned.put("quizzes", learnedQuizzes);
                notLearned.put("lessons", notLearnedLessons);
                notLearned.put("quizzes", notLearnedQuizzes);

                result.put("learned", learned);
                result.put("notLearned", notLearned);

                return ResponseEntity.ok(result);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
    }

    public ResponseEntity<?> getInformationCourse(String id) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            if(course.getStatus() == EStatus.INACTIVE){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Course is not available");
            }
            Map<String, Object> overview = new HashMap<>();
            overview.put("id", String.valueOf(course.getId()));
            overview.put("title", course.getTitle());
            overview.put("description", course.getDescription());
            overview.put("thumbnail", course.getThumbnail());
            overview.put("categories", course.getCategories());
            overview.put("price", course.getPrice());
            overview.put("studentsCount", course.getStudentsEnrolled() != null ?
                    course.getStudentsEnrolled().size() : 0);
            overview.put("contentCount",
                    (course.getLessons() != null ? course.getLessons().size() : 0) +
                            (course.getQuizzes() != null ? course.getQuizzes().size() : 0));
            overview.put("averageRating", course.getAverageRating());
            String getTeacherName;
            Optional<User> userTeacher = userService.findById(String.valueOf(course.getTeacherId()));
            getTeacherName = userTeacher.map(value -> value.getFirstName() + " " + value.getLastName())
                    .orElse("Unknown Teacher");
            overview.put("teacherName", getTeacherName);
            overview.put("totalTimeLimit", course.getTotalTimeLimit());
            return ResponseEntity.ok(overview);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }

    }

    public ResponseEntity<?> getLessonAndQuizForCourseAnyone(String id) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));

        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            List<Lesson> lessons = lessonRepository.findByCourseId(course.getId());
            List<Quizzes> quizzes = quizzesRepository.findByCourseId(course.getId());

            // Collect lessons into a list of maps
            List<Map<String, Object>> lessonList = new ArrayList<>();
            lessons.forEach(lesson -> {
                Map<String, Object> lessonMap = new HashMap<>();
                lessonMap.put("lessonId", lesson.getId().toString());
                lessonMap.put("lessonTitle", lesson.getTitle());
                lessonMap.put("lessonShortTitle", lesson.getShortTile()); // Fixed typo from "lessonShortTilte"
                lessonMap.put("orderLesson", lesson.getOrder());
                lessonList.add(lessonMap);
            });

            // Collect quizzes into a list of maps
            List<Map<String, Object>> quizList = new ArrayList<>();
            quizzes.forEach(quiz -> {
                Map<String, Object> quizMap = new HashMap<>();
                quizMap.put("quizId", quiz.getId().toString());
                quizMap.put("passingScore", quiz.getPassingScore());
                quizMap.put("questionCount", quiz.getQuestions() != null ? quiz.getQuestions().size() : 0);
                quizMap.put("orderQuiz", quiz.getOrder());
                quizList.add(quizMap);
            });

            // Sort both lists by order
            Comparator<Map<String, Object>> orderComparator = Comparator.comparingInt(m ->
                    (Integer) m.getOrDefault("orderLesson", m.getOrDefault("orderQuiz", 0)));
            lessonList.sort(orderComparator);
            quizList.sort(orderComparator);

            // Prepare response
            Map<String, Object> result = new HashMap<>();
            result.put("lessons", lessonList);
            result.put("quizzes", quizList);

            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
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
