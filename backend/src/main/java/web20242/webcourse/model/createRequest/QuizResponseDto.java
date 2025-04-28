package web20242.webcourse.model.createRequest;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import web20242.webcourse.model.constant.EQuestion;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponseDto {
    private String id;
    private String courseId;
    private String title;
    private String description;
    private Integer order;
    private Double passingScore;
    private Integer timeLimit;
    private List<QuestionResponseDto> questions;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponseDto {
        private String question;
        private String material;
        private EQuestion eQuestion;
        private List<String> options;
        // Không có trường correctAnswer
    }
}