package web20242.webcourse.model; // Điều chỉnh package theo dự án của bạn

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

@Document(collection = "lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "courseId")
    private ObjectId courseId; // ID của khóa học trong collection "courses"

    @Field(name = "title")
    private String title;

    @Field(name="shortTile")
    private String shortTile;

    @Field(name = "content")
    private String content;

    @Field(name = "videoUrl")
    private String videoUrl; // URL video

    @Field(name = "materials")
    private ArrayList<String> materials; // Danh sách URL tài liệu

    @Field(name="status")
    private EStatus status; // "ACTIVE", "INACTIVE"

    @Field(name = "order")
    private Integer order; // Thứ tự bài học, dùng Integer thay cho Number

    @Field(name="timeLimit")
    private Integer timeLimit; // Thời gian giới hạn làm bài, tính bằng phút

    @Field(name = "createdAt", targetType = FieldType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Field(name="updatedAt", targetType = FieldType.TIMESTAMP)
    private LocalDateTime updateAt;
}