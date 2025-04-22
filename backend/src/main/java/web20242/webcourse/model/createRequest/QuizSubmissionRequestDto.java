package web20242.webcourse.model.createRequest;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class QuizSubmissionRequestDto {
    private List<UserAnswer> answers;

    @Data
    public static class UserAnswer {
        private String question;
        private ArrayList<String> selectedAnswer;
    }
}