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

@Document(collection = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "user_id")
    private ObjectId userId; // ID của user trong collection "users"

    @Field(name = "course_id")
    private ObjectId courseId; // ID của khóa học trong collection "courses"

    @Field(name = "progress")
    private Double progress; // Tiến độ hoàn thành (%), dùng Double thay cho Number

    @Field(name = "status")
    private String status; // "In Progress", "Completed"

    @Field(name = "score")
    private Double score; // Điểm số nếu có bài quiz, dùng Double thay cho Number

    @Field(name = "completed_at",targetType = FieldType.TIMESTAMP)
    private LocalDateTime completedAt; // Ngày hoàn thành
}