package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import web20242.webcourse.model.constant.EStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Document(collection = "courses")
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

    @Field(name = "teacherId")
    private ObjectId teacherId; // ID của user có role là "TEACHER"

    @Indexed
    @Field(name = "categories")
    private ArrayList<String> categories; // Danh mục khóa học

    @Field(name = "thumbnail")
    private String thumbnail; // URL ảnh

    @Field(name="status")
    private EStatus status; // "ACTIVE", "INACTIVE"

    @Field(name = "price")
    private Double price; // Dùng Double thay cho Number

    @Field(name = "studentsEnrolled")
    private ArrayList<ObjectId> studentsEnrolled; // Danh sách ID học viên

    @Field(name = "lessons")
    private ArrayList<ObjectId> lessons; // Danh sách ID bài học

    @Field(name = "quizzes")
    private ArrayList<ObjectId> quizzes; // Danh sách ID quiz

    @Field(name = "totalTimeLimit")
    private Integer totalTimeLimit; // Tổng thời gian giới hạn làm bài, tính bằng phút

    @Indexed(name = "averageRating_index")
    @Field(name = "averageRating")
    private Double averageRating;

    @Field(name= "request")
    private ArrayList<ObjectId> request;

    @Field(name = "createdAt")
    private LocalDateTime createdAt;

    @Field(name = "updatedAt")
    private LocalDateTime updatedAt;
}
