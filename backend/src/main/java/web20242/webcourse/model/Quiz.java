package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "course_id")
    private ObjectId courseId; // ID của khóa học trong collection "courses"

    @Field(name = "title")
    private String title;

    @Field(name = "questions")
    private List<web2024.webcourse.model.Question> questions; // Danh sách câu hỏi

    @Field(name = "passing_score")
    private Double passingScore; // Điểm tối thiểu để qua, dùng Double thay cho Number

    @Field(name = "created_at", targetType = FieldType.TIMESTAMP)
    private LocalDateTime createdAt;
}