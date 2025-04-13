package web20242.webcourse.model.createRequest;

import lombok.Data;

@Data
public class QuizSubmissionResponseDto {
    private Double score;
    private Double passingScore;
    private boolean passed;
    private String message;
}