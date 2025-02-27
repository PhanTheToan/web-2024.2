package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.EnrollmentRepository;
import web20242.webcourse.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    public Enrollment createEnrollment(String userIdHex, String courseIdHex, Double progress, EStatus status, Double score, LocalDateTime completedAt) {
        // Chuyển userIdHex và courseIdHex thành ObjectId
        ObjectId userId = new ObjectId(userIdHex);
        ObjectId courseId = new ObjectId(courseIdHex);

        // Kiểm tra userId và courseId có tồn tại không
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("userId không tồn tại trong collection users");
        }
        Optional<Course> course = courseRepository.findById(courseId);
        if (course.isEmpty()) {
            throw new IllegalArgumentException("courseId không tồn tại trong collection courses");
        }

        // Kiểm tra progress hợp lệ (0-100)
        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException("progress phải từ 0 đến 100");
        }

        // Kiểm tra status hợp lệ
        if (!"In Progress".equals(status) && !"Completed".equals(status)) {
            throw new IllegalArgumentException("status phải là 'In Progress' hoặc 'Completed'");
        }

        // Tạo Enrollment
        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .courseId(courseId)
                .progress(progress)
                .status(status)
                .score(score)
                .completedAt(completedAt) // Nhận từ FE
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Cập nhật studentsEnrolled trong Course
        Course existingCourse = course.get();
        List<ObjectId> studentsEnrolled = existingCourse.getStudentsEnrolled();
        if (!studentsEnrolled.contains(userId)) {
            studentsEnrolled.add(userId);
            existingCourse.setStudentsEnrolled(studentsEnrolled);
            courseRepository.save(existingCourse);
        }

        return savedEnrollment;
    }
}
