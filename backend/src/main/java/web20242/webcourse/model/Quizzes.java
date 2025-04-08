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
import java.util.ArrayList;

@Document(collection = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quizzes {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "courseId")
    private ObjectId courseId; // ID của khóa học trong collection "courses"

    @Field(name = "title")
    private String title;

    @Field(name = "questions")
    private ArrayList<Question> questions; // Danh sách câu hỏi

    @Field(name = "order")
    private Integer order; // Thứ tự bài quiz, dùng Integer thay cho Number

    @Field(name = "passingScore")
    private Double passingScore; // Điểm tối thiểu để qua, dùng Double thay cho Number

    @Field(name="timeLimit")
    private Integer timeLimit; // Thời gian làm bài (phút)

    @Field(name = "createdAt", targetType = FieldType.TIMESTAMP)
    private LocalDateTime createdAt;
}