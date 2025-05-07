package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.*;
import web20242.webcourse.model.constant.EQuestion;
import web20242.webcourse.model.constant.ERole;
import web20242.webcourse.model.createRequest.CourseCreateRequest;
import web20242.webcourse.model.createRequest.QuizSubmissionRequestDto;
import web20242.webcourse.repository.*;
import web20242.webcourse.service.CourseService;
import web20242.webcourse.service.FileService;
import web20242.webcourse.service.QuizGenerationService;
import web20242.webcourse.service.UserService;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/course")
public class CourseController {
    @Autowired
    private UserService userService;
    @Autowired
    private CourseService courseService;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private QuizzesRepository quizzesRepository;
    @Autowired
    private LessonRepository lessonRepository;

    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/deleteUserCourse/{userId}/{courseId}")
    public ResponseEntity<?> deleteUserLeaveCourse(@PathVariable String userId, @PathVariable String courseId) {
        userService.deleteUserLeaveCourse(userId, courseId);
        return ResponseEntity.ok("User removed from course successfully");
    }

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getCoursesByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String teacherIds,
            @RequestParam(required = false) Double ratingMin,
            @RequestParam(required = false) Double ratingMax) {
        Pageable pageable = PageRequest.of(page, size);
        List<String> categories = category != null ? Arrays.asList(category.split(",")) : null;
        List<String> teacherIdList = teacherIds != null ? Arrays.asList(teacherIds.split(",")) : null;
        Page<Map<String, Object>> coursePage = courseService.searchCourses(
                null, categories, teacherIdList, ratingMin, ratingMax, pageable
        );
        return ResponseEntity.ok(coursePage);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/search-course-admin")
    public ResponseEntity<Page<Map<String, Object>>> searchCoursesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> coursePage = courseService.searchCoursesForAdmin(
                query, status, pageable
        );
        return ResponseEntity.ok(coursePage);
    }
    @GetMapping("/search")
    public ResponseEntity<Page<Map<String, Object>>> searchCourses(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String teacherIds,
            @RequestParam(required = false) Double ratingMin,
            @RequestParam(required = false) Double ratingMax) {
        Pageable pageable = PageRequest.of(page, size);
        List<String> categories = category != null ? Arrays.asList(category.split(",")) : null;
        List<String> teacherIdList = teacherIds != null ? Arrays.asList(teacherIds.split(",")) : null;
        Page<Map<String, Object>> coursePage = courseService.searchCourses(
                query, categories, teacherIdList, ratingMin, ratingMax, pageable
        );
        return ResponseEntity.ok(coursePage);
    }
    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherForSlideBar(){
        return ResponseEntity.ok(courseService.getTeacherForSlideBar());
    }

    @PutMapping("/update/timelimit")
    public ResponseEntity<?> updateTimelimits(){
        return ResponseEntity.ok(courseService.updateTimeLimit());
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/complete-course")
    public ResponseEntity<?> getCourseCompleteForUser(Principal principal) {
        return ResponseEntity.ok(courseService.getAllCoursesComplete(principal));
    }
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/progress-course")
    public ResponseEntity<?> getCourseIncompleteForUser(Principal principal) {
        return ResponseEntity.ok(courseService.getAllCoursesInprocess(principal));
    }
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/notstarted-course")
    public ResponseEntity<?> getCourseIncompleteForUser1(Principal principal) {
        return ResponseEntity.ok(courseService.getAllCoursesNotStarted(principal));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/lessonandquiz/{id}")
    public ResponseEntity<?> getLessonAndQuiz(@PathVariable String id){
        return ResponseEntity.ok(courseService.getLessonAndQuizForCourse(id));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PutMapping("/update-order")
    public ResponseEntity<?> updateOrder(
            @RequestParam String itemType,
            @RequestParam String itemId,
            @RequestParam Integer newOrder,
            Principal principal) {
        return ResponseEntity.ok(courseService.updateOrderForItem(itemType, new ObjectId(itemId), newOrder, principal));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @PutMapping("/update-order-list")
    public ResponseEntity<?> updateOrder(@RequestBody Map<String,String> list, Principal principal) {
        return ResponseEntity.ok(courseService.updateOrderForList(list, principal));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @GetMapping("/getlessonquiz/{id}")
    public ResponseEntity<?> getLessonAndQuizForCourse(@PathVariable String id, Principal principal){
        return ResponseEntity.ok(courseService.getLessonAndQuizForCourseTeacher(id, principal));
    }

    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PostMapping("/create")
    public ResponseEntity<?> createCourse(@RequestBody CourseCreateRequest course, Principal principal) {
        User user = userService.findByUsername(principal.getName());
        String teacherId = course.getTeacherId();
        if (!ObjectId.isValid(teacherId)) {
            return ResponseEntity.status(400).body("Invalid teacherId format");
        }
        return ResponseEntity.ok(courseService.createCourse(course, user));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/admin/create")
    public ResponseEntity<?> updateCourse(@RequestBody CourseCreateRequest course) {
        String id = course.getTeacherId();
        User user = userService.findById(id).orElse(null);
        String teacherId = course.getTeacherId();
        if (!ObjectId.isValid(teacherId)) {
            return ResponseEntity.status(400).body("Invalid teacherId format");
        }
        if(user!=null) {
            return ResponseEntity.ok(courseService.createCourse(course, user));
        }else
            return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @PostMapping("/create-lesson")
    public ResponseEntity<?> createLesson(@RequestBody Lesson lesson, @RequestParam String courseId) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Course not found");
        }
        return ResponseEntity.ok(courseService.createLesson(courseOptional.get(),lesson));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @PostMapping("/create-quiz")
    public ResponseEntity<?> createLesson(@RequestBody Quizzes quizzes, @RequestParam String courseId, @RequestParam EQuestion type) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        quizzes.setType(type);
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Course not found");
        }
        return ResponseEntity.ok(courseService.createQuiz(courseOptional.get(),quizzes));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @PutMapping("/update-quiz/{quizId}")
    public ResponseEntity<?> updateQuiz(
            @PathVariable String quizId,
            @RequestBody Quizzes updatedQuiz,
            @RequestParam String courseId
    ) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Course not found");
        }

        Optional<Quizzes> quizOptional = quizzesRepository.findById(new ObjectId(quizId));
        if (quizOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Quiz not found");
        }

        Course course = courseOptional.get();
        Quizzes existingQuiz = quizOptional.get();

        if (!existingQuiz.getCourseId().equals(course.getId())) {
            return ResponseEntity.status(400).body("Quiz does not belong to this course");
        }

        return ResponseEntity.ok(courseService.updateQuiz(course, existingQuiz, updatedQuiz));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @PutMapping("/update-lesson/{lessonId}")
    public ResponseEntity<?> updateLesson(
            @PathVariable String lessonId,
            @RequestBody Lesson updatedLesson,
            @RequestParam String courseId
    ) {
        // Tìm khóa học
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Course not found");
        }

        // Tìm lesson hiện có
        Optional<Lesson> lessonOptional = lessonRepository.findById(new ObjectId(lessonId));
        if (lessonOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Lesson not found");
        }

        Course course = courseOptional.get();
        Lesson existingLesson = lessonOptional.get();

        // Kiểm tra lesson có thuộc khóa học không
        if (!existingLesson.getCourseId().equals(course.getId())) {
            return ResponseEntity.status(400).body("Lesson does not belong to this course");
        }

        return ResponseEntity.ok(courseService.updateLesson(course, existingLesson, updatedLesson));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @GetMapping("/get-quiz/{quizId}")
    public ResponseEntity<?> getQuizForEdit(@PathVariable String quizId) {
        Optional<Quizzes> quizOptional = quizzesRepository.findById(new ObjectId(quizId));
        if (quizOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Quiz not found");
        }

        Quizzes quiz = quizOptional.get();

        Optional<Course> courseOptional = courseRepository.findById(quiz.getCourseId());
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Associated course not found");
        }

        return ResponseEntity.ok(quiz);
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @GetMapping("/get-lesson/{lessonId}")
    public ResponseEntity<?> getLessonForEdit(@PathVariable String lessonId) {
        Optional<Lesson> lessonOptional = lessonRepository.findById(new ObjectId(lessonId));
        if (lessonOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Lesson not found");
        }

        Lesson lesson = lessonOptional.get();

        Optional<Course> courseOptional = courseRepository.findById(lesson.getCourseId());
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Associated course not found");
        }

        return ResponseEntity.ok(lesson);
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete-quiz/{quizId}")
    public ResponseEntity<?> deleteQuiz(
            @PathVariable String quizId,
            @RequestParam String courseId
    ) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Course not found");
        }

        Optional<Quizzes> quizOptional = quizzesRepository.findById(new ObjectId(quizId));
        if (quizOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Quiz not found");
        }

        Course course = courseOptional.get();
        Quizzes quiz = quizOptional.get();

        if (!quiz.getCourseId().equals(course.getId())) {
            return ResponseEntity.status(400).body("Quiz does not belong to this course");
        }

        return courseService.deleteQuiz(course, quiz);
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @PutMapping("/update/course-info/{id}")
    public ResponseEntity<?> updateCourseInfo(@RequestBody Course course, @PathVariable String id,Principal principal){
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        course.setId(new ObjectId(id));
        if (userOptional.isPresent()){
            User user = userOptional.get();
            if(user.getRole() == ERole.ROLE_ADMIN){
                return ResponseEntity.ok(courseService.updateCourseInfo(course));
            }else {
                Course course1 = courseRepository.findById(course.getId()).orElse(null);
                assert course1 != null;
                if(course1.getTeacherId().equals(user.getId())){
                    return ResponseEntity.ok(courseService.updateCourseInfo(course));
                }else {
                    return ResponseEntity.status(401).body("Not Authenticated");
                }
            }
        }else {
            return ResponseEntity.status(401).body("User not found");
        }
    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete-lesson/{lessonId}")
    public ResponseEntity<?> deleteLesson(
            @PathVariable String lessonId,
            @RequestParam String courseId
    ) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Course not found");
        }

        Optional<Lesson> lessonOptional = lessonRepository.findById(new ObjectId(lessonId));
        if (lessonOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Lesson not found");
        }

        Course course = courseOptional.get();
        Lesson lesson = lessonOptional.get();

        if (!lesson.getCourseId().equals(course.getId())) {
            return ResponseEntity.status(400).body("Lesson does not belong to this course");
        }

        return courseService.deleteLesson(course, lesson);
    }

//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/update-order")
//    public ResponseEntity<?> updateOrder(){
//        return ResponseEntity.ok(courseService.updateOrder());
//    }

//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/update/admin/status")
//    public ResponseEntity<?> updateStatus(){
//        return ResponseEntity.ok(courseService.updateStatus());
//    }

    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @PutMapping("/update/status/{id}")
    public ResponseEntity<?> updateStatusById(@PathVariable String id, Principal principal){
        return ResponseEntity.ok(courseService.updateStatusForTeacher(id, principal));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update/admin-status/{id}")
    public ResponseEntity<?> updateStatusByAdmin(@PathVariable String id){
        return ResponseEntity.ok(courseService.updateStatusForAdmin(id));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCourseForever(@PathVariable String id){
        return ResponseEntity.ok(courseService.deleteCourseForever(id));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/test")
    public ResponseEntity<?> test(Principal principal){
        return ResponseEntity.ok(courseService.test(principal));
    }
//    @PostMapping("/filter")
//    public ResponseEntity<?> getFilteredCourses(@RequestBody CourseFilterRequest filterRequest) {
//        return courseService.getFilteredCourses(filterRequest);
//    }
//    @GetMapping("/updateRatings")
//    public void updateRating(){
//        courseService.updateRatingsDaily();
//    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/set-owner")
    public ResponseEntity<?> setOwner(@RequestBody Map<String, String> data) {
        String courseId = data.get("courseId");
        String userId = data.get("userId");
        return ResponseEntity.ok(courseService.setOwner(courseId, userId));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAlls() {
        return ResponseEntity.ok(courseService.getAllCoursesForAdmin());
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @GetMapping("/all-teacher")
    public ResponseEntity<?> getAllsForTeacher(Principal principal) {
        return ResponseEntity.ok(courseService.getAllCoursesForTeacher(principal));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/admin/all-user/{id}")
    public ResponseEntity<?> getAllsForTeacherByIdForAdmin(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getAllUserPerCousrseByAdmin(id));
    }
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    @GetMapping("/teacher/all-user/{id}")
    public ResponseEntity<?> getAllsForTeacherByIdForTeacher(@PathVariable String id, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        Course course = courseRepository.findById(new ObjectId(id)).orElse(null);
        if(course!=null && userOptional.    isPresent()){
            if(course.getTeacherId().equals(userOptional.get().getId())){
                return ResponseEntity.ok(courseService.getAllUserPerCousrseByAdmin(id));
            }
            else return ResponseEntity.status(401).body("You are not the teacher of this course");
        }
        else return ResponseEntity.status(401).body("Course not found or User not found");
    }
    // ROLE USER GET LESSON AND QUIZ
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/lesson-quiz/{id}")        // id = Course id
    public ResponseEntity<?> getLessonAndQuizForCourseUser(@PathVariable String id, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()) {
            Optional<Enrollment> enrollmentOptional = enrollmentRepository.findByUserIdAndCourseId( userOptional.get().getId(),new ObjectId(id));
            if(enrollmentOptional.isPresent()){
                return ResponseEntity.ok(courseService.getLessonAndQuizForCourseUser(enrollmentOptional.get().getId(), principal));
            }
            else return ResponseEntity.status(401).body("User not enrolled in this course");
        }
        else return ResponseEntity.status(401).body("User not found");
    }

    @GetMapping("/info/{id}")
    public ResponseEntity<?> getInformationCourse(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getInformationCourse(id));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @GetMapping("/info-course/{id}")
    public ResponseEntity<?> getInformationCourseForAdminTeacher(@PathVariable String id, Principal principal) {
        return ResponseEntity.ok(courseService.getInformationCourseForAdminTeacher(id,principal));
    }
    @GetMapping("/info/check/{id}")
    public ResponseEntity<?> checkInfo(@PathVariable String id,Principal principal){
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()){
            return ResponseEntity.ok(courseService.checkInfo(id,userOptional.get().getId()));
        }
        else return ResponseEntity.status(401).body("User not found");
    }
    @GetMapping("/lesson_quiz/{id}")
    public ResponseEntity<?> getLessonAndQuizForCourseUser(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getLessonAndQuizForCourseAnyone(id));
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/lesson/{id}")
    public ResponseEntity<?> getLessonForCourseUser(@PathVariable String id, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()) {
            return ResponseEntity.ok(courseService.getLessonForCourseUser(id, userOptional.get()));
        }
        else return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/quiz/{id}")
    public ResponseEntity<?> getQuizForCourseUser(@PathVariable String id, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if(userOptional.isPresent()) {
            return ResponseEntity.ok(courseService.getQuizForCourseUser(id, userOptional.get()));
        }
        else return ResponseEntity.status(401).body("User not found");
    }
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/quiz/{id}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable String id,
            @RequestBody QuizSubmissionRequestDto submission,
            Principal principal
    ) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        return courseService.gradeQuiz(id, submission, userOptional.get());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @GetMapping("/statistics/{id}")
    public ResponseEntity<?> getStatistics(@PathVariable String id, Principal principal) {
        Course course = courseRepository.findById(new ObjectId(id)).orElse(null);
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if(course == null || user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Course or User not found");
        }
        if (course.getTeacherId().equals(user.getId()) || user.getRole() == ERole.ROLE_ADMIN) {
            return ResponseEntity.ok(courseService.getStatistics(course));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You are not the teacher of this course");
        }
    }





//    @PutMapping("/cleanup-invalid-categories")
//    public ResponseEntity<?> cleanupInvalidCategories() {
//        return courseService.updateCategoryNames();
//    }
//    @GetMapping("/page/{page}")
//    public ResponseEntity<?> getCoursesByPage(@PathVariable int page) {
//        return ResponseEntity.ok(courseService.getCoursesByPage(page));
//    }
}
