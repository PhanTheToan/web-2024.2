package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.*;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EnrollmentService {
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizzesRepository quizzesRepository;

    public void createEnrollment(ObjectId userId, String courseIdHex) {
        ObjectId courseId = new ObjectId(courseIdHex);

        Optional<Course> course = courseRepository.findById(courseId);
        Optional<User> user = userRepository.findById(userId);

        if (user.isEmpty()) {
            throw new IllegalArgumentException("userId không tồn tại trong collection users");
        }
        if (course.isEmpty()) {
            throw new IllegalArgumentException("courseId không tồn tại trong collection courses");
        }

        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (existingEnrollment.isPresent()) {
            throw new IllegalStateException("Người dùng đã đăng ký khóa học này rồi");
        }

        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .courseId(courseId)
                .progress(0.0)
                .status(EStatus.NOTSTARTED)
                .timeCurrent(0)
                .enrolledAt(LocalDateTime.now())
                .completedAt(null)
                .build();

        enrollmentRepository.save(enrollment);

        Course existingCourse = course.get();
        ArrayList<ObjectId> studentsEnrolled = existingCourse.getStudentsEnrolled();
        if (studentsEnrolled == null) {
            studentsEnrolled = new ArrayList<>();
        }
        if (!studentsEnrolled.contains(userId)) {
            studentsEnrolled.add(userId);
            existingCourse.setStudentsEnrolled(studentsEnrolled);
            courseRepository.save(existingCourse);
        }

        User existingUser = user.get();
        ArrayList<ObjectId> coursesEnrolled = existingUser.getCoursesEnrolled();
        if (coursesEnrolled == null) {
            coursesEnrolled = new ArrayList<>();
        }
        if (!coursesEnrolled.contains(courseId)) {
            coursesEnrolled.add(courseId);
            existingUser.setCoursesEnrolled(coursesEnrolled);
            userRepository.save(existingUser);
        }
    }

    public ResponseEntity<?> updateProgressForLesson(String courseId, String itemId, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), new ObjectId(courseId));
            Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
            Optional<Lesson> lessonOptional = lessonRepository.findById(new ObjectId(itemId));

            if (enrollment.isPresent() && courseOptional.isPresent() && lessonOptional.isPresent()) {
                Enrollment existingEnrollment = enrollment.get();

                ArrayList<ObjectId> lessonAndQuizId = existingEnrollment.getLessonAndQuizId();
                if (lessonAndQuizId == null) {
                    lessonAndQuizId = new ArrayList<>();
                    existingEnrollment.setLessonAndQuizId(lessonAndQuizId);
                }

                ObjectId objectItemId = new ObjectId(itemId);
                if (!lessonAndQuizId.contains(objectItemId)) {
                    Integer timeCurrent = existingEnrollment.getTimeCurrent() != null ? existingEnrollment.getTimeCurrent() : 0;
                    timeCurrent += lessonOptional.get().getTimeLimit();

                    Number progress = 0.0;
                    progress = (double) timeCurrent / courseOptional.get().getTotalTimeLimit() * 100;
                    existingEnrollment.setProgress(progress.doubleValue());
                    existingEnrollment.setTimeCurrent(timeCurrent);

                    if ((int) progress.doubleValue() == 100) {
                        existingEnrollment.setStatus(EStatus.DONE);
                        existingEnrollment.setCompletedAt(LocalDateTime.now());
                    } else if ((int) progress.doubleValue() > 0 && (int) progress.doubleValue() < 100) {
                        existingEnrollment.setStatus(EStatus.INPROGRESS);
                    }

                    lessonAndQuizId.add(objectItemId);
                    enrollmentRepository.save(existingEnrollment);
                }
                return ResponseEntity.ok("Cập nhật tiến độ thành công");
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy enrollment cho khóa học này");
            }
        }
        return ResponseEntity.status(404).body("Không tìm thấy người dùng");
    }

    public ResponseEntity<?> updateProgressForQuiz(String courseId, String itemId, Double newScore, Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), new ObjectId(courseId));
            Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
            Optional<Quizzes> quizzesOptional = quizzesRepository.findById(new ObjectId(itemId));

            if (enrollment.isPresent() && courseOptional.isPresent() && quizzesOptional.isPresent()) {
                Enrollment existingEnrollment = enrollment.get();

                ArrayList<ObjectId> lessonAndQuizId = existingEnrollment.getLessonAndQuizId();
                if (lessonAndQuizId == null) {
                    lessonAndQuizId = new ArrayList<>();
                    existingEnrollment.setLessonAndQuizId(lessonAndQuizId);
                }

                ArrayList<Enrollment.QuizScore> quizScores = existingEnrollment.getQuizScores();
                if (quizScores == null) {
                    quizScores = new ArrayList<>();
                    quizScores.add(Enrollment.QuizScore.builder().quizId(new ObjectId(itemId)).score(newScore).build());
                    existingEnrollment.setQuizScores(quizScores);
                }

                ObjectId quizId = new ObjectId(itemId);
                boolean scoreUpdated = false;

                for (Enrollment.QuizScore quizScore : quizScores) {
                    if (quizScore.getQuizId().equals(quizId)) {
                        if (newScore != null && newScore > quizScore.getScore()) {
                            quizScore.setScore(newScore);
                            scoreUpdated = true;
                        }
                        break;
                    }
                }

                if (!scoreUpdated && newScore != null) {
                    Enrollment.QuizScore newQuizScore = Enrollment.QuizScore.builder()
                            .quizId(quizId)
                            .score(newScore)
                            .build();
                    quizScores.add(newQuizScore);
                }

                if (!lessonAndQuizId.contains(quizId)) {
                    Integer timeCurrent = existingEnrollment.getTimeCurrent() != null ? existingEnrollment.getTimeCurrent() : 0;
                    int timeLimit = quizzesOptional.get().getTimeLimit() != null ? quizzesOptional.get().getTimeLimit() : 0;
                    timeCurrent += timeLimit;

                    int totalTimeLimit = courseOptional.get().getTotalTimeLimit() != null ? courseOptional.get().getTotalTimeLimit() : 1; // Default to 1 to avoid division by zero
                    Number progress = totalTimeLimit != 0 ? (double) timeCurrent / totalTimeLimit * 100 : 0.0;
                    existingEnrollment.setProgress(progress.doubleValue());
                    existingEnrollment.setTimeCurrent(timeCurrent);

                    if ((int) progress.doubleValue() == 100) {
                        existingEnrollment.setStatus(EStatus.DONE);
                        existingEnrollment.setCompletedAt(LocalDateTime.now());
                    }

                    lessonAndQuizId.add(quizId);
                }

                enrollmentRepository.save(existingEnrollment);
                return ResponseEntity.ok("Cập nhật tiến độ thành công");
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy enrollment cho khóa học này");
            }
        }
        return ResponseEntity.status(404).body("Không tìm thấy người dùng");
    }

    public ResponseEntity<?> getAllEnrollments(Principal principal) {
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<Enrollment> enrollments = enrollmentRepository.findByUserId(user.getId());
            if (enrollments.isEmpty()) {
                return ResponseEntity.status(404).body("Không tìm thấy enrollment cho người dùng này");
            } else {
                List<Map<String, String>> filteredEnrollments = enrollments.stream()
                        .map(enrollment -> {
                            Map<String, String> map = new HashMap<>();
                            map.put("EnrollmentID", enrollment.getId().toHexString());
                            map.put("CourseId", enrollment.getCourseId().toHexString());
                            return map;
                        })
                        .toList();

                return ResponseEntity.ok(filteredEnrollments);

            }
        }
        return ResponseEntity.status(401).body("Người dùng không tồn tại");
    }

    public void deleteEnrollment(String id, User user) {
        Optional<Enrollment> enrollmentOptional = enrollmentRepository.findByUserIdAndCourseId(user.getId(), new ObjectId(id));
        Course course = courseRepository.findById(new ObjectId(id)).orElse(null);
        ArrayList<ObjectId> studentsEnrolled = course.getStudentsEnrolled();
        if (studentsEnrolled != null) {
            studentsEnrolled.remove(user.getId());
            course.setStudentsEnrolled(studentsEnrolled);
            courseRepository.save(course);
        }
        ArrayList<ObjectId> coursesEnrolled = user.getCoursesEnrolled();
        if (coursesEnrolled != null) {
            coursesEnrolled.remove(new ObjectId(id));
            user.setCoursesEnrolled(coursesEnrolled);
            userRepository.save(user);
        }
        if (enrollmentOptional.isPresent()) {
            Enrollment enrollment = enrollmentOptional.get();
            if (enrollment.getUserId().equals(user.getId())) {
                enrollmentRepository.delete(enrollment);
                ResponseEntity.ok("Xóa thành công");
            } else {
                ResponseEntity.status(401).body("Người dùng không có quyền xóa enrollment này");
            }
        } else {
            ResponseEntity.status(404).body("Không tìm thấy enrollment với ID: " + id);
        }

    }

    public ResponseEntity<?> getAllRequestForUser(User user){
        ArrayList<ObjectId> request = user.getRequestedCourses();
        if (request != null && !request.isEmpty()) {
            List<Course> courses = courseRepository.findAllById(request);
            List<Map<String, String>> filteredCourses = courses.stream()
                    .map(course -> {
                        Map<String, String> map = new HashMap<>();
                        map.put("CourseID", course.getId().toHexString());
                        Optional<User> userOptional = userRepository.findById(course.getTeacherId());
                        if(userOptional.isPresent()){
                            String firstName = userOptional.get().getFirstName() != null ? userOptional.get().getFirstName() : "";
                            String lastName = userOptional.get().getLastName() != null ? userOptional.get().getLastName() : "";
                            String fullName = firstName + " " + lastName;
                            map.put("Teacher", fullName);
                        }else {
                            map.put("Teacher", "Unknown");
                        }
                        map.put("Title", course.getTitle());
                        return map;
                    })
                    .toList();
            return ResponseEntity.ok(filteredCourses);
        } else {
            return ResponseEntity.status(404).body("Không có yêu cầu nào");
        }
    }

    public void createEnrollmentByRequest(User user, String courseIdHex) {
        ObjectId courseId = new ObjectId(courseIdHex);

        Optional<Course> course = courseRepository.findById(courseId);

        if (course.isEmpty()) {
            throw new IllegalArgumentException("courseId không tồn tại trong collection courses");
        }

        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId);
        if (existingEnrollment.isPresent()) {
            throw new IllegalStateException("Người dùng đã đăng ký khóa học này rồi");
        }

        Course existingCourse = course.get();
        ArrayList<ObjectId> request = existingCourse.getRequest();
        if (request == null) {
            request = new ArrayList<>();
        }
        if (!request.contains(user.getId())) {
            request.add(user.getId());
            existingCourse.setRequest(request);
            courseRepository.save(existingCourse);
        }

        ArrayList<ObjectId> requestCoursed = user.getRequestedCourses();
        if (requestCoursed == null) {
            requestCoursed = new ArrayList<>();
        }
        if (!requestCoursed.contains(courseId)) {
            requestCoursed.add(courseId);
            user.setRequestedCourses(requestCoursed);
            userRepository.save(user);
        }
    }

    public void acceptEnrollmentRequestForAdmin(String courseId, User user) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));

        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();

            ArrayList<ObjectId> request = course.getRequest();
            ArrayList<ObjectId> requestCoursed = user.getRequestedCourses();
            if (request != null && request.contains(user.getId()) &&  requestCoursed != null && requestCoursed.contains(course.getId())) {
                request.remove(user.getId());
                course.setRequest(request);
                courseRepository.save(course);
                requestCoursed.remove(course.getId());
                user.setRequestedCourses(requestCoursed);
                userRepository.save(user);
                try {
                    createEnrollment(user.getId(), courseId);
                    ResponseEntity.ok("Xác nhận yêu cầu thành công");
                    return;
                }catch (IllegalStateException e){
                    ResponseEntity.status(401).body("Người dùng đã đăng ký khóa học này rồi");
                    return;
                }
            }
        }
        ResponseEntity.status(401).body("Không có quyền xác nhận yêu cầu này");
    }
    public void acceptEnrollmentRequestForTeacher(String courseId, User user, Principal principal) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());
        if (courseOptional.isPresent() && userOptional.isPresent()) {
            Course course = courseOptional.get();
            User userTeacher = userOptional.get();
            if(!userTeacher.getId().equals(course.getTeacherId())){
                ResponseEntity.status(401).body("Không có quyền xác nhận yêu cầu này");
                return;
            }
            ArrayList<ObjectId> request = course.getRequest();
            ArrayList<ObjectId> requestCoursed = user.getRequestedCourses();
            if (request != null && request.contains(user.getId()) &&  requestCoursed != null && requestCoursed.contains(course.getId())) {
                request.remove(user.getId());
                course.setRequest(request);
                courseRepository.save(course);
                requestCoursed.remove(course.getId());
                user.setRequestedCourses(requestCoursed);
                userRepository.save(user);
                try {
                    createEnrollment(user.getId(), courseId);
                    ResponseEntity.ok("Xác nhận yêu cầu thành công");
                    return;
                }catch (IllegalStateException e){
                    ResponseEntity.status(401).body("Người dùng đã đăng ký khóa học này rồi");
                    return;
                }
            }
        }
        ResponseEntity.status(401).body("Không có quyền xác nhận yêu cầu này");
    }
    public void rejectEnrollmentRequestForAdmin(String courseId, User user) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));

        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();

            ArrayList<ObjectId> request = course.getRequest();
            ArrayList<ObjectId> requestCoursed = user.getRequestedCourses();
            if (request != null && request.contains(user.getId()) &&  requestCoursed != null && requestCoursed.contains(course.getId())) {
                request.remove(user.getId());
                course.setRequest(request);
                courseRepository.save(course);
                requestCoursed.remove(course.getId());
                user.setRequestedCourses(requestCoursed);
                userRepository.save(user);
                ResponseEntity.ok("Từ chối yêu cầu đăng kí thành công");
                return;
            }
            ResponseEntity.status(401).body("Không yêu cầu không tồn tại");
            return;

        }
        ResponseEntity.status(401).body("Không có quyền xác nhận yêu cầu này");

    }
    public void rejectEnrollmentRequestForTeacher(String courseId, User user, Principal principal) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());

        if (courseOptional.isPresent() && userOptional.isPresent()) {
            Course course = courseOptional.get();
            User userTeacher = userOptional.get();
            if(!userTeacher.getId().equals(course.getTeacherId())){
                ResponseEntity.status(401).body("Không có quyền xác nhận yêu cầu này");
                return;
            }
            ArrayList<ObjectId> request = course.getRequest();
            ArrayList<ObjectId> requestCoursed = user.getRequestedCourses();
            if (request != null && request.contains(user.getId()) &&  requestCoursed != null && requestCoursed.contains(course.getId())) {
                request.remove(user.getId());
                course.setRequest(request);
                courseRepository.save(course);
                requestCoursed.remove(course.getId());
                user.setRequestedCourses(requestCoursed);
                userRepository.save(user);
                ResponseEntity.ok("Từ chối yêu cầu đăng kí thành công");
                return;
            }
            ResponseEntity.status(401).body("Không yêu cầu không tồn tại");
            return;
        }
        ResponseEntity.status(401).body("Không có quyền xác nhận yêu cầu này");
    }
    public ResponseEntity<?> allRequestEnrolled(String courseId){
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> requestList = new ArrayList<>();
            response.put("request", requestList);
            Course course = courseOptional.get();
            List<ObjectId> request = course.getRequest();
            if (request != null && !request.isEmpty()) {
                List<User> users = userRepository.findAllById(request);
                for (User user : users) {
                    Map<String, Object> map = new HashMap<>();
                    String firstName = user.getFirstName()!=null ? user.getFirstName() : "";
                    String lastName = user.getLastName() != null ? user.getLastName() : "";
                    map.put("fullName", firstName + " " + lastName);
                    map.put("email", user.getEmail());
                    requestList.add(map);
                }
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.ok("Không có yêu cầu nào");
            }
        } else {
            return ResponseEntity.status(404).body("Không tìm thấy khóa học với ID: " + courseId);
        }
    }
    public void addUserEnrolledForAdmin(String courseId, User user) {
        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));

        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            createEnrollment(user.getId(), courseId);
            ResponseEntity.ok("Thêm người");
            return;
        }
        ResponseEntity.status(401).body("Thêm không thành công");
    }
    public void addUserEnrolledForTeacher(String courseId, User userEnroll, Principal principal){
        Optional<User> userOptional = userRepository.findByUsername(principal.getName());

        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (userOptional.isPresent() && courseOptional.isPresent()) {
            User user = userOptional.get();
            Course course = courseOptional.get();
            if (course.getTeacherId().equals(user.getId())){
                createEnrollment(userEnroll.getId(),courseId);
            }else {
                ResponseEntity.status(401).body("Người dùng không có quyền thêm người vào khóa học này");
                return;
            }
        }
        ResponseEntity.status(401).body("Thêm không thành công");
    }
}
