package web20242.webcourse.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    private String question; // Nội dung câu hỏi
    private String material; // Tài liệu tham khảo (nếu có)
    private ArrayList<String> options; // Danh sách đáp án
    private String correctAnswer; // Đáp án đúng
}