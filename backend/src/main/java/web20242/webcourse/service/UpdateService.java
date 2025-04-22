package web20242.webcourse.service;

import org.springframework.stereotype.Service;
import web20242.webcourse.model.Quizzes;
import web20242.webcourse.model.constant.EQuestion;
import web20242.webcourse.model.createRequest.Question;
import web20242.webcourse.repository.PopularCategoryRepository;
import web20242.webcourse.repository.QuizzesRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UpdateService {

    private final QuizzesRepository quizRepository;

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
}
