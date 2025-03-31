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
import web20242.webcourse.model.constant.EStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "userId")
    private ObjectId userId; // ID của user trong collection "users"

    @Field(name = "courseId")
    private ObjectId courseId; // ID của khóa học trong collection "courses"

    @Field(name= "lessonIdAndQuizId")
    private ArrayList<ObjectId> lessonAndQuizId; // ID của bài học hoặc bài quiz trong collection "lessons" hoặc "quizzes"

    @Field(name = "progress")
    private Double progress; // Tiến độ hoàn thành (%), dùng Double thay cho Number

    @Field(name = "status")
    private EStatus status; // "In Progress", "Completed"

    @Field(name="enrolledAt",targetType = FieldType.TIMESTAMP)
    private LocalDateTime enrolledAt; // Ngày đăng ký

    @Field(name = "completedAt",targetType = FieldType.TIMESTAMP)
    private LocalDateTime completedAt; // Ngày hoàn thành
}