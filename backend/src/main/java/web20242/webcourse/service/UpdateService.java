package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.*;
import web20242.webcourse.model.constant.EQuestion;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.model.createRequest.Question;
import web20242.webcourse.repository.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UpdateService {

    private final QuizzesRepository quizRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizzesRepository quizzesRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    public UpdateService(QuizzesRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public void migrateQuizzes() {
        List<Quizzes> quizzes = quizRepository.findAll();

        for (Quizzes quiz : quizzes) {
            boolean needsUpdate = false;
            List<Question> updatedQuestions = new ArrayList<>();

            for (Question question : quiz.getQuestions()) {
                Question updatedQuestion = Question.builder()
                        .question(question.getQuestion())
                        .material(question.getMaterial())
                        .options(question.getOptions())
                        .correctAnswer(question.getCorrectAnswer())
                        .eQuestion(question.getEQuestion())
                        .build();

                if (updatedQuestion.getCorrectAnswer() == null || updatedQuestion.getCorrectAnswer().isEmpty()) {
                    if (question.getCorrectAnswer() != null && !question.getCorrectAnswer().isEmpty()) {
                        updatedQuestion.setCorrectAnswer(new ArrayList<>(List.of(question.getCorrectAnswer().get(0))));
                        needsUpdate = true;
                    } else {
                        updatedQuestion.setCorrectAnswer(new ArrayList<>());
                    }
                }

                if (updatedQuestion.getEQuestion() == null) {
                    int optionCount = updatedQuestion.getOptions() != null ? updatedQuestion.getOptions().size() : 0;
                    if (optionCount >= 1) {
                        updatedQuestion.setEQuestion(EQuestion.SINGLE_CHOICE);
                    }else {
                        updatedQuestion.setEQuestion(EQuestion.SHORT_ANSWER);
                    }
                    needsUpdate = true;
                }

                updatedQuestions.add(updatedQuestion);
            }

            if (needsUpdate) {
                quiz.setQuestions(new ArrayList<>(updatedQuestions));
                quiz.setUpdateAt(LocalDateTime.now());
                quizRepository.save(quiz);
            }
        }
    }

    public ResponseEntity<?> update_course_enroll() {
        List<User> userOptional = userRepository.findAll();
        userOptional.forEach(user -> {
            List<Enrollment> enrollmentList = enrollmentRepository.findByUserId(user.getId());
            ArrayList<ObjectId> courseEnroll = new ArrayList<>();
            enrollmentList.forEach(enrollment -> {
                courseEnroll.add(enrollment.getCourseId());
            });
            user.setCoursesEnrolled(courseEnroll);
            userRepository.save(user);
        });
        return ResponseEntity.ok("Done !");
    }

    public void update_time() {
        List<Course> courses = courseRepository.findAll();
        courses.forEach(course -> {
            Integer timelimit = 0;

            ArrayList<ObjectId> arrayListLesson = course.getLessons();
            ArrayList<ObjectId> arrayListQuiz = course.getQuizzes();

            // Xử lý lessons
            if (arrayListLesson != null) {
                for (ObjectId lessonId : arrayListLesson) {
                    if (lessonId == null) {
                        continue; // Bỏ qua lessonId null
                    }
                    Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
                    if (lesson == null) {
                        continue; // Bỏ qua lesson không tồn tại
                    }
                    if (lesson.getTimeLimit() != null) {
                        timelimit += lesson.getTimeLimit();
                    }
                }
            }

            // Xử lý quizzes
            if (arrayListQuiz != null) {
                for (ObjectId quizId : arrayListQuiz) {
                    if (quizId == null) {
                        continue; // Bỏ qua quizId null
                    }
                    Quizzes quiz = quizzesRepository.findById(quizId).orElse(null);
                    if (quiz == null) {
                        continue; // Bỏ qua quiz không tồn tại
                    }
                    if (quiz.getTimeLimit() != null) {
                        timelimit += quiz.getTimeLimit();
                    }
                }
            }

            // Cập nhật course
            course.setTotalTimeLimit(timelimit);
            course.setUpdatedAt(LocalDateTime.now());
            courseRepository.save(course);
        });
    }
    public void updateEnrollment(){
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        for (Enrollment enrollment : enrollments) {
            Course course = courseRepository.findById(enrollment.getCourseId()).orElse(null);
            if(course == null) {
                enrollmentRepository.delete(enrollment);
                continue;
            }
            ArrayList<ObjectId> lessonAndQuiz = enrollment.getLessonAndQuizId();
            Integer timelimit = course.getTotalTimeLimit();
            Integer timeCurrent = 0;
            if(lessonAndQuiz != null) {
                for (ObjectId id : lessonAndQuiz) {
                    Lesson lesson = lessonRepository.findById(id).orElse(null);
                    if (lesson != null) {
                        timeCurrent += lesson.getTimeLimit();
                    } else {
                        Quizzes quizzes = quizzesRepository.findById(id).orElse(null);
                        if (quizzes != null) {
                            timeCurrent += quizzes.getTimeLimit();
                        } else {
                            lessonAndQuiz.remove(id);
                        }
                    }
                }
            }
            Double percent = (double) timeCurrent / timelimit * 100;
            enrollment.setTimeCurrent(timeCurrent);
            enrollment.setProgress(percent);
            if (percent >=99.90) {
                enrollment.setStatus(EStatus.DONE);
                enrollment.setCompletedAt(LocalDateTime.now());
            } else if (percent > 0.0) {
                enrollment.setStatus(EStatus.INPROGRESS);
            } else {
                enrollment.setStatus(EStatus.NOTSTARTED);
            }
            enrollmentRepository.save(enrollment);
        }
    }
}
