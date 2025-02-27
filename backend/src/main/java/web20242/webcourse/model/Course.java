package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "title")
    private String title;

    @Field(name = "description")
    private String description;

    @Field(name = "teacher_id")
    private ObjectId teacherId; // ID của user có role là "TEACHER"

    @Field(name = "categories")
    private List<String> categories; // Danh mục khóa học

    @Field(name = "thumbnail")
    private String thumbnail; // URL ảnh

    @Field(name = "price")
    private Double price; // Dùng Double thay cho Number

    @Field(name = "students_enrolled")
    private List<ObjectId> studentsEnrolled; // Danh sách ID học viên

    @Field(name = "lessons")
    private List<ObjectId> lessons; // Danh sách ID bài học

    @Field(name = "quizzes")
    private List<ObjectId> quizzes; // Danh sách ID quiz

    @Field(name = "created_at")
    private LocalDateTime createdAt;

    @Field(name = "updated_at")
    private LocalDateTime updatedAt;
}
