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
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "user_id")
    private ObjectId userId; // ID của user trong collection "users"

    @Field(name = "course_id")
    private ObjectId courseId; // ID của khóa học trong collection "courses"

    @Field(name = "rating")
    private Integer rating; // Điểm từ 1 - 5, dùng Integer thay cho Number

    @Field(name = "comment")
    private String comment;

    @Field(name = "created_at", targetType = FieldType.TIMESTAMP)
    private LocalDateTime createdAt;
}