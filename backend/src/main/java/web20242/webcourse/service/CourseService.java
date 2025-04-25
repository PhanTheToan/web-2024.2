package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web20242.webcourse.model.*;
import web20242.webcourse.model.constant.EQuestion;
import web20242.webcourse.model.constant.ERole;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.model.createRequest.*;
import web20242.webcourse.repository.*;
import org.springframework.data.mongodb.core.MongoTemplate;


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
    public ResponseEntity<?> getAllCoursesNotStarted(Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
            List<Map<String, Object>> courseOverviews = enrollments.stream()
                    .filter(enrollment -> EStatus.NOTSTARTED.equals(enrollment.getStatus()))
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
                    lessonMap.put("status",lesson.getStatus());
                    return lessonMap;
                }).collect(Collectors.toList());

                List<Map<String, Object>> quizData = quizzes.stream().map(quiz -> {
                    Map<String, Object> quizMap = new HashMap<>();
                    quizMap.put("quizId", quiz.getId().toString());
                    quizMap.put("passingScore", quiz.getPassingScore());
                    quizMap.put("title",quiz.getTitle());
                    quizMap.put("questionCount", quiz.getQuestions().size());
                    quizMap.put("orderQuiz", quiz.getOrder());
                    quizMap.put("status",quiz.getStatus());
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
                lessonMap.put("status", lesson.getStatus());
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
                quizMap.put("status",quiz.getStatus());
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

    public ResponseEntity<?> checkInfo(String id,ObjectId userId) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
            for (Enrollment enrollment : enrollments) {
                if (enrollment.getUserId().equals(userId)) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("courseId", course.getId().toHexString());
                    map.put("userId", userId.toHexString());
                    map.put("progress", enrollment.getProgress());
                    return ResponseEntity.ok(map);
                }
            }
            return ResponseEntity.ok("You are not enrolled in this course");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }

    }

    public void updateRating() {
        List<Course> courseList = courseRepository.findAll();
        for (Course course : courseList) {
            Double avgRating;
            int countReview = 0;
            int sumRating = 0;
            List<Review> reviews = reviewRepository.findByCourseId(course.getId());

            if (reviews != null) {
                for (Review review : reviews) {
                    if (review.getRating() != null) {
                        countReview++;
                        sumRating += review.getRating();
                    }
                }
                avgRating = countReview > 0 ? (double) sumRating / countReview : null;
            } else {
                avgRating = null; // Hoặc 0.0 nếu bạn muốn mặc định là 0
            }

            course.setAverageRating(avgRating);
            courseRepository.save(course);
        }
    }

    public ResponseEntity<?> updateOrderForList(Map<String, String> list, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        User user = userService.findByUsername(principal.getName());
        for (Map.Entry<String, String> entry : list.entrySet()) {
            String itemId = entry.getKey();
            System.out.println("Item ID: " + itemId);
            System.out.println("New Order: " + entry.getValue());
            String newOrderStr = entry.getValue();
            Integer newOrder = Integer.parseInt(newOrderStr);
            Optional<Lesson> lessonOptional = lessonRepository.findById(new ObjectId(itemId));
            Optional<Quizzes> quizzesOptional = quizzesRepository.findById(new ObjectId(itemId));
            if (lessonOptional.isPresent()) {
                Lesson lesson = lessonOptional.get();
                Course course = courseRepository.findById(lesson.getCourseId()).orElse(null);
                if(user.getRole() == ERole.ROLE_ADMIN) {
                    lesson.setOrder(newOrder);
                    lessonRepository.save(lesson);
                }else if(course != null && !user.getId().equals(course.getTeacherId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this course");
                }else{
                    lesson.setOrder(newOrder);
                    lessonRepository.save(lesson);
                }
            } else if (quizzesOptional.isPresent()) {
                Quizzes quizzes = quizzesOptional.get();
                Course course = courseRepository.findById(quizzes.getCourseId()).orElse(null);
                if(user.getRole() == ERole.ROLE_ADMIN) {
                    quizzes.setOrder(newOrder);
                    quizzesRepository.save(quizzes);
                }
                else if (course != null && !user.getId().equals(course.getTeacherId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this course");
                }else {
                        quizzes.setOrder(newOrder);
                        quizzesRepository.save(quizzes);
                }
            }
        }
        return ResponseEntity.ok("Done !");
    }


    public ResponseEntity<?> createCourse(CourseCreateRequest input, User user) {
        Course course = new Course();
        course.setTitle(input.getTitle());
        course.setDescription(input.getDescription());
        course.setThumbnail(input.getThumbnail());
        course.setPrice(Double.valueOf(input.getPrice()));
        course.setTeacherId(user.getId());
        course.setStatus(input.getStatus());
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        course.setAverageRating(0.0);
        course.setTotalTimeLimit(0);
        course.setLessons(new ArrayList<>());

        ArrayList<String> categories = new ArrayList<>();
        List<?> categoriesInput = input.getCategories();
        if (categoriesInput != null) {
            for (Object category : categoriesInput) {
                if (category != null) {
                    categories.add(category.toString().trim());
                    String categoryName = category.toString().trim();
                    categories.add(categoryName);

                    Category category1 = popularCategoryRepository.findByCategory(categoryName);
                    if (category1 != null) {
                        int count = category1.getCount();
                        category1.setCount(count + 1);
                        popularCategoryRepository.save(category1);
                    } else {
                        // Xử lý nếu category không tồn tại trong cơ sở dữ liệu
                        System.out.println("Category not found: " + categoryName);
                    }
                }
            }
        }
        course.setCategories(categories);

        course.setQuizzes(new ArrayList<>());
        course.setStudentsEnrolled(new ArrayList<>());
        course.setRequest(new ArrayList<>());
        courseRepository.save(course);
        return ResponseEntity.ok("Course created successfully");
    }

    public ResponseEntity<?> createLesson(Course course, Lesson lesson) {
        if (lesson.getTitle() == null || lesson.getTitle().isEmpty()) {
            return ResponseEntity.badRequest().body("Title is required");
        }
        if (lesson.getTimeLimit() == null || lesson.getTimeLimit() < 0) {
            return ResponseEntity.badRequest().body("Invalid time limit");
        }
        if (lesson.getMaterials() == null) {
            lesson.setMaterials(new ArrayList<>());
        }
        course.getLessons().add(lesson.getId());
        Integer timeLimit = course.getTotalTimeLimit();
        timeLimit += lesson.getTimeLimit();
        lesson.setCourseId(course.getId());
        course.setTotalTimeLimit(timeLimit);
        course.setUpdatedAt(LocalDateTime.now());
        lesson.setUpdateAt(LocalDateTime.now());
        lesson.setCreatedAt(LocalDateTime.now());
        lessonRepository.save(lesson);
        courseRepository.save(course);
        return ResponseEntity.ok("Lesson created successfully");
    }
    public ResponseEntity<?> createQuiz(Course course, Quizzes quizzes) {
        if (quizzes.getTimeLimit() == null || quizzes.getTimeLimit() < 0) {
            return ResponseEntity.badRequest().body("Invalid time limit");
        }
        if (quizzes.getQuestions() == null || quizzes.getQuestions().isEmpty()) {
            return ResponseEntity.badRequest().body("Quiz must have at least one question");
        }
        course.getQuizzes().add(quizzes.getId());
        Integer timeLimit = course.getTotalTimeLimit();
        timeLimit += quizzes.getTimeLimit();
        quizzes.setCourseId(course.getId());
        course.setTotalTimeLimit(timeLimit);
        course.setUpdatedAt(LocalDateTime.now());
        quizzes.setUpdateAt(LocalDateTime.now());
        quizzes.setCreatedAt(LocalDateTime.now());
        quizzesRepository.save(quizzes);
        courseRepository.save(course);
        return ResponseEntity.ok("Lesson created successfully");
    }

    public ResponseEntity<?> updateQuiz(Course course, Quizzes existingQuiz, Quizzes updatedQuiz) {
        int oldTimeLimit = existingQuiz.getTimeLimit() != null ? existingQuiz.getTimeLimit() : 0;
        int newTimeLimit = updatedQuiz.getTimeLimit() != null ? updatedQuiz.getTimeLimit() : 0;
        int courseTimeLimit = course.getTotalTimeLimit() != null ? course.getTotalTimeLimit() : 0;
        courseTimeLimit = courseTimeLimit - oldTimeLimit + newTimeLimit;
        course.setTotalTimeLimit(courseTimeLimit);

        existingQuiz.setDescription(updatedQuiz.getDescription());
        existingQuiz.setOrder(updatedQuiz.getOrder());
        existingQuiz.setPassingScore(updatedQuiz.getPassingScore());
        existingQuiz.setStatus(updatedQuiz.getStatus());
        existingQuiz.setTimeLimit(updatedQuiz.getTimeLimit());

        if (updatedQuiz.getQuestions() != null) {
            existingQuiz.setQuestions(updatedQuiz.getQuestions());
        }

        existingQuiz.setUpdateAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());

        quizzesRepository.save(existingQuiz);
        courseRepository.save(course);

        return ResponseEntity.ok("Quiz updated successfully");
    }

    public ResponseEntity<?> updateLesson(Course course, Lesson existingLesson, Lesson updatedLesson) {
        Integer oldTimeLimit = existingLesson.getTimeLimit() != null ? existingLesson.getTimeLimit() : 0;
        Integer newTimeLimit = updatedLesson.getTimeLimit() != null ? updatedLesson.getTimeLimit() : 0;
        Integer courseTimeLimit = course.getTotalTimeLimit() != null ? course.getTotalTimeLimit() : 0;
        courseTimeLimit = courseTimeLimit - oldTimeLimit + newTimeLimit;
        course.setTotalTimeLimit(courseTimeLimit);

        existingLesson.setTitle(updatedLesson.getTitle());
        existingLesson.setShortTile(updatedLesson.getShortTile());
        existingLesson.setContent(updatedLesson.getContent());
        existingLesson.setVideoUrl(updatedLesson.getVideoUrl());
        existingLesson.setStatus(updatedLesson.getStatus());
        existingLesson.setOrder(updatedLesson.getOrder());
        existingLesson.setTimeLimit(updatedLesson.getTimeLimit());

        if (updatedLesson.getMaterials() != null) {
            existingLesson.setMaterials(updatedLesson.getMaterials());
        }

        existingLesson.setUpdateAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());

        lessonRepository.save(existingLesson);
        courseRepository.save(course);

        return ResponseEntity.ok("Lesson updated successfully");
    }
    @Transactional
    public ResponseEntity<?> deleteQuiz(Course course, Quizzes quiz) {
        Integer quizTimeLimit = quiz.getTimeLimit() != null ? quiz.getTimeLimit() : 0;
        Integer courseTimeLimit = course.getTotalTimeLimit() != null ? course.getTotalTimeLimit() : 0;
        courseTimeLimit -= quizTimeLimit;
        course.setTotalTimeLimit(Math.max(courseTimeLimit, 0)); // Đảm bảo không âm
        List<Enrollment> enrollmentOptional = enrollmentRepository.findByCourseId(course.getId());
        enrollmentOptional.forEach(enrollment -> {
            ArrayList<ObjectId> lessonAndQuizIds = enrollment.getLessonAndQuizId();
            if (lessonAndQuizIds != null && lessonAndQuizIds.contains(quiz.getId())) {
                lessonAndQuizIds.remove(quiz.getId());
                enrollment.setLessonAndQuizId(lessonAndQuizIds);
                enrollmentRepository.save(enrollment);
            }
        });
        course.getQuizzes().remove(quiz.getId());

        course.setUpdatedAt(LocalDateTime.now());

        quizzesRepository.delete(quiz);

        courseRepository.save(course);

        return ResponseEntity.ok("Quiz deleted successfully");
    }
    @Transactional
    public ResponseEntity<?> deleteLesson(Course course, Lesson lesson) {
        Integer lessonTimeLimit = lesson.getTimeLimit() != null ? lesson.getTimeLimit() : 0;
        Integer courseTimeLimit = course.getTotalTimeLimit() != null ? course.getTotalTimeLimit() : 0;
        courseTimeLimit -= lessonTimeLimit;
        course.setTotalTimeLimit(Math.max(courseTimeLimit, 0)); // Đảm bảo không âm
        List<Enrollment> enrollmentOptional = enrollmentRepository.findByCourseId(course.getId());
        enrollmentOptional.forEach(enrollment -> {
            ArrayList<ObjectId> lessonAndQuizIds = enrollment.getLessonAndQuizId();
            if (lessonAndQuizIds != null && lessonAndQuizIds.contains(lesson.getId())) {
                lessonAndQuizIds.remove(lesson.getId());
                enrollment.setLessonAndQuizId(lessonAndQuizIds);
                enrollmentRepository.save(enrollment);
            }
        });
        course.getLessons().remove(lesson.getId());

        course.setUpdatedAt(LocalDateTime.now());

        lessonRepository.delete(lesson);

        courseRepository.save(course);

        return ResponseEntity.ok("Lesson deleted successfully");
    }

    public ResponseEntity<?> getLessonForCourseUser(String id, User user) {
        if(user == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }else {
            return ResponseEntity.ok(lessonRepository.findById(new ObjectId(id)).orElse(null));
        }
    }

    public ResponseEntity<?> getQuizForCourseUser(String id, User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        Quizzes quizzes = quizzesRepository.findById(new ObjectId(id)).orElse(null);
        if (quizzes == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Quiz not found");
        }

        QuizResponseDto quizDto = new QuizResponseDto();
        quizDto.setId(quizzes.getId().toHexString());
        quizDto.setCourseId(quizzes.getCourseId().toHexString());
        quizDto.setTitle(quizzes.getTitle());
        quizDto.setDescription(quizzes.getDescription());
        quizDto.setOrder(quizzes.getOrder());
        quizDto.setPassingScore(quizzes.getPassingScore());
        quizDto.setTimeLimit(quizzes.getTimeLimit());
        quizDto.setCreatedAt(quizzes.getCreatedAt());
        quizDto.setUpdateAt(quizzes.getUpdateAt());

        List<QuizResponseDto.QuestionResponseDto> questionDtos = new ArrayList<>();
        for (Question question : quizzes.getQuestions()) {
            QuizResponseDto.QuestionResponseDto questionDto = new QuizResponseDto.QuestionResponseDto();
            questionDto.setQuestion(question.getQuestion());
            questionDto.setMaterial(question.getMaterial());
            questionDto.setOptions(question.getOptions());
            questionDtos.add(questionDto);
        }
        quizDto.setQuestions(questionDtos);

        return ResponseEntity.ok(quizDto);
    }

    public ResponseEntity<?> gradeQuiz(String id, QuizSubmissionRequestDto submission, User user) {
        Optional<Quizzes> quizOptional = quizzesRepository.findById(new ObjectId(id));
        if (quizOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Quiz not found");
        }

        Quizzes quiz = quizOptional.get();

        // Kiểm tra user đã đăng ký khóa học
        if (!user.getCoursesEnrolled().contains(quiz.getCourseId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not enrolled in this course");
        }

        List<Question> quizQuestions = quiz.getQuestions();
        List<QuizSubmissionRequestDto.UserAnswer> userAnswers = submission.getAnswers();

        // Kiểm tra số lượng câu trả lời
        if (userAnswers == null || userAnswers.size() != quizQuestions.size()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Number of answers (" + (userAnswers == null ? 0 : userAnswers.size()) +
                            ") does not match number of questions (" + quizQuestions.size() + ")");
        }

        int correctCount = 0;
        List<String> incorrectQuestions = new ArrayList<>(); // Lưu câu hỏi sai để báo cáo

        for (int i = 0; i < quizQuestions.size(); i++) {
            Question question = quizQuestions.get(i);
            QuizSubmissionRequestDto.UserAnswer userAnswer = userAnswers.get(i);

            if (!question.getQuestion().equals(userAnswer.getQuestion())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Question at index " + i + " does not match");
            }

            boolean isCorrect = false;
            switch (question.getEQuestion()) {
                case SINGLE_CHOICE:
                    isCorrect = checkSingleChoiceAnswer(question, userAnswer);
                    break;
                case MULTIPLE_CHOICE:
                    isCorrect = checkMultipleChoiceAnswer(question, userAnswer);
                    break;
                case SHORT_ANSWER:
                    isCorrect = checkShortAnswer(question, userAnswer);
                    break;
                default:
                    break;
            }

            if (isCorrect) {
                correctCount++;
            } else {
                incorrectQuestions.add(question.getQuestion());
            }
        }

        double totalQuestions = quizQuestions.size();
        double score = (correctCount / totalQuestions) * 100;
        double passingScore = quiz.getPassingScore() != null ? quiz.getPassingScore() : 0;
        boolean passed = score >= passingScore;
        QuizSubmissionResponseDto response = new QuizSubmissionResponseDto();
        response.setScore(score);
        response.setPassingScore(passingScore);
        response.setPassed(passed);
        response.setMessage(passed ? "Congratulations, you passed the quiz!" : "Sorry, you did not pass the quiz.");
        response.setIncorrectQuestions(incorrectQuestions); // Thêm thông tin câu hỏi sai

        return ResponseEntity.ok(response);
    }

    private boolean checkSingleChoiceAnswer(Question question, QuizSubmissionRequestDto.UserAnswer userAnswer) {
        if (userAnswer.getSelectedAnswer() == null || userAnswer.getSelectedAnswer().isEmpty() ||
                question.getCorrectAnswer() == null || question.getCorrectAnswer().isEmpty()) {
            return false;
        }
        return question.getCorrectAnswer().get(0).equals(userAnswer.getSelectedAnswer().get(0));
    }

    private boolean checkMultipleChoiceAnswer(Question question, QuizSubmissionRequestDto.UserAnswer userAnswer) {
        if (userAnswer.getSelectedAnswer() == null || question.getCorrectAnswer() == null) {
            return false;
        }
        List<String> userAnswers = userAnswer.getSelectedAnswer();
        List<String> correctAnswers = question.getCorrectAnswer();
        return userAnswers.size() == correctAnswers.size() && userAnswers.containsAll(correctAnswers);
    }

    private boolean checkShortAnswer(Question question, QuizSubmissionRequestDto.UserAnswer userAnswer) {
        // Kiểm tra null
        if (userAnswer.getSelectedAnswer() == null || userAnswer.getSelectedAnswer().isEmpty() ||
                question.getCorrectAnswer() == null || question.getCorrectAnswer().isEmpty()) {
            return false;
        }

        String userAnswerText = userAnswer.getSelectedAnswer().get(0);
        String correctAnswerText = question.getCorrectAnswer().get(0);

        String normalizedUserAnswer = normalizeShortAnswer(userAnswerText);
        String normalizedCorrectAnswer = normalizeShortAnswer(correctAnswerText);

        return normalizedUserAnswer.equals(normalizedCorrectAnswer);
    }

    private String normalizeShortAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        return answer.replaceAll("\\s+", "").toUpperCase();
    }

    public ResponseEntity<?> getAllUserPerCousrseByAdmin(String id) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(id));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
            List<Map<String, Object>> userOverviews = enrollments.stream()
                    .map(enrollment -> {
                        Map<String, Object> overview = new HashMap<>();
                        User user = userService.findById(enrollment.getUserId().toHexString()).orElse(null);
                        if (user != null) {
                            overview.put("id", String.valueOf(user.getId()));
                            overview.put("username", user.getUsername());
                            overview.put("firstName", user.getFirstName());
                            overview.put("lastName", user.getLastName());
                            overview.put("email", user.getEmail());
                            overview.put("progress", enrollment.getProgress());
                            overview.put("status", enrollment.getStatus());
                            return overview;
                        }
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userOverviews);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course not found");
        }
    }

    public Page<Map<String, Object>> getCoursesByPage(Pageable pageable, String status) {
        Page<Course> coursePage;
        if (status != null) {
            coursePage = courseRepository.findByStatus(EStatus.valueOf(status), pageable);
        } else {
            coursePage = courseRepository.findByStatus(EStatus.ACTIVE, pageable); // Mặc định ACTIVE
        }
        return coursePage.map(this::mapCourseToOverview);
    }

    private Map<String, Object> mapCourseToOverview(Course course) {
        Map<String, Object> overview = new HashMap<>();
        overview.put("id", course.getId().toString());
        overview.put("title", course.getTitle());

        Optional<User> userTeacher = userService.findById(course.getTeacherId().toString());
        if (userTeacher.isEmpty()) {
            overview.put("teacherFullName", "Unknown Teacher");
            overview.put("teacherId", null);
        } else {
            User teacher = userTeacher.get();
            overview.put("teacherFullName", teacher.getFirstName() + " " + teacher.getLastName());
            overview.put("teacherId", course.getTeacherId().toString());
        }

        overview.put("courseStatus", course.getStatus().name());
        overview.put("thumbnail", course.getThumbnail());
        overview.put("categories", course.getCategories());
        overview.put("price", course.getPrice());
        overview.put("studentsCount", course.getStudentsEnrolled() != null ? course.getStudentsEnrolled().size() : 0);
        overview.put("contentCount", course.getLessons() != null ? course.getLessons().size() : 0);
        overview.put("totalTimeLimit", course.getTotalTimeLimit());

        return overview;
    }
    public Page<Map<String, Object>> searchCoursesForAdmin(String query, String status, Pageable pageable) {
        Page<Course> coursePage;
        if (query == null || query.trim().isEmpty()) {
            if (status != null) {
                coursePage = courseRepository.findByStatus(
                        EStatus.valueOf(status.toUpperCase()), pageable);
            } else {
                coursePage = courseRepository.findAll(pageable);
            }
        } else {
            if (status != null) {
                coursePage = courseRepository.findByTitleContainingIgnoreCaseAndStatus(
                        query, EStatus.valueOf(status.toUpperCase()), pageable);
            } else {
                coursePage = courseRepository.findByTitleContainingIgnoreCase(query, pageable);
            }
        }
        return coursePage.map(this::mapCourseToOverview);
    }

    public Page<Map<String, Object>> searchCourses(
            String query,
            List<String> categories,
            List<String> teacherIds,
            Double ratingMin,
            Double ratingMax,
            Pageable pageable
    ) {
        // Chuyển teacherIds từ String sang ObjectId
        List<ObjectId> teacherObjectIds = teacherIds != null
                ? teacherIds.stream()
                .map(ObjectId::new)
                .collect(Collectors.toList())
                : null;

        Page<Course> coursePage;

        // Xử lý tìm kiếm theo tiêu đề
        if (query != null && !query.trim().isEmpty()) {
            // Lọc theo tất cả tiêu chí
            if (categories != null && !categories.isEmpty() && teacherObjectIds != null && !teacherObjectIds.isEmpty() && ratingMin != null && ratingMax != null) {
                coursePage = courseRepository.findByCategoriesAndRatingAndTeacherIds(
                        categories, ratingMin, ratingMax, teacherObjectIds, pageable
                );
            }
            // Lọc theo danh mục và đánh giá
            else if (categories != null && !categories.isEmpty() && ratingMin != null && ratingMax != null) {
                coursePage = courseRepository.findByCategoriesAndRating(
                        categories, ratingMin, ratingMax, pageable
                );
            }
            // Lọc theo danh mục và giảng viên
            else if (categories != null && !categories.isEmpty() && teacherObjectIds != null && !teacherObjectIds.isEmpty()) {
                coursePage = courseRepository.findByCategoriesAndTeacherIds(
                        categories, teacherObjectIds, pageable
                );
            }
            // Lọc theo đánh giá và giảng viên
            else if (ratingMin != null && ratingMax != null && teacherObjectIds != null && !teacherObjectIds.isEmpty()) {
                coursePage = courseRepository.findByRatingAndTeacherIds(
                        ratingMin, ratingMax, teacherObjectIds, pageable
                );
            }
            // Lọc theo danh mục
            else if (categories != null && !categories.isEmpty()) {
                coursePage = courseRepository.findByCategories(categories, pageable);
            }
            // Lọc theo đánh giá
            else if (ratingMin != null && ratingMax != null) {
                coursePage = courseRepository.findByRating(ratingMin, ratingMax, pageable);
            }
            // Lọc theo giảng viên
            else if (teacherObjectIds != null && !teacherObjectIds.isEmpty()) {
                coursePage = courseRepository.findByTeacherIds(teacherObjectIds, pageable);
            }
            // Chỉ tìm kiếm theo tiêu đề
            else {
                coursePage = courseRepository.findByTitleContainingIgnoreCaseAndStatus(
                        query, EStatus.ACTIVE, pageable
                );
            }
        } else {
            // Không có query, lọc theo các tiêu chí khác
            if (categories != null && !categories.isEmpty() && teacherObjectIds != null && !teacherObjectIds.isEmpty() && ratingMin != null && ratingMax != null) {
                coursePage = courseRepository.findByCategoriesAndRatingAndTeacherIds(
                        categories, ratingMin, ratingMax, teacherObjectIds, pageable
                );
            } else if (categories != null && !categories.isEmpty() && ratingMin != null && ratingMax != null) {
                coursePage = courseRepository.findByCategoriesAndRating(
                        categories, ratingMin, ratingMax, pageable
                );
            } else if (categories != null && !categories.isEmpty() && teacherObjectIds != null && !teacherObjectIds.isEmpty()) {
                coursePage = courseRepository.findByCategoriesAndTeacherIds(
                        categories, teacherObjectIds, pageable
                );
            } else if (ratingMin != null && ratingMax != null && teacherObjectIds != null && !teacherObjectIds.isEmpty()) {
                coursePage = courseRepository.findByRatingAndTeacherIds(
                        ratingMin, ratingMax, teacherObjectIds, pageable
                );
            } else if (categories != null && !categories.isEmpty()) {
                coursePage = courseRepository.findByCategories(categories, pageable);
            } else if (ratingMin != null && ratingMax != null) {
                coursePage = courseRepository.findByRating(ratingMin, ratingMax, pageable);
            } else if (teacherObjectIds != null && !teacherObjectIds.isEmpty()) {
                coursePage = courseRepository.findByTeacherIds(teacherObjectIds, pageable);
            } else {
                coursePage = courseRepository.findByStatus(EStatus.ACTIVE, pageable);
            }
        }

        return coursePage.map(this::mapCourseToOverview);
    }

    public ResponseEntity<?> getTeacherForSlideBar() {
        List<User> teachers = userRepository.findByRole(ERole.ROLE_TEACHER);
        List<Map<String, Object>> teacherOverviews = teachers.stream()
                .map(teacher -> {
                    if (teacher.getStatus() == EStatus.INACTIVE) {
                        return null; // Bỏ qua giáo viên không hoạt động
                    }
                    Map<String, Object> overview = new HashMap<>();
                    overview.put("id", String.valueOf(teacher.getId()));
                    overview.put("fullName", teacher.getFirstName() + " " + teacher.getLastName());
                    return overview;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(teacherOverviews);
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
