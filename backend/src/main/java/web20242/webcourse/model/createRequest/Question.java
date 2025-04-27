package web20242.webcourse.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;
import web20242.webcourse.model.constant.EQuestion;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    private String question; // Nội dung câu hỏi
    private String material; // Tài liệu tham khảo (nếu có)
    private EQuestion eQuestion; // Loại câu hỏi (SINGLE_CHOICE, MULTIPLE_CHOICE, SHORT_ANSWER)
    private ArrayList<String> options; // Danh sách đáp án
    private ArrayList<String> correctAnswer; // Đáp án đúng
}