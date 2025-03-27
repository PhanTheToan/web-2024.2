package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    private String question; // Nội dung câu hỏi
    private List<String> options; // Danh sách đáp án
    private String correctAnswer; // Đáp án đúng
}