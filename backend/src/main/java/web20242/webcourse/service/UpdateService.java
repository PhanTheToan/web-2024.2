package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.model.Quizzes;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.EQuestion;
import web20242.webcourse.model.createRequest.Question;
import web20242.webcourse.repository.EnrollmentRepository;
import web20242.webcourse.repository.PopularCategoryRepository;
import web20242.webcourse.repository.QuizzesRepository;
import web20242.webcourse.repository.UserRepository;

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
}
