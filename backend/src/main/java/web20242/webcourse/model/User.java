package web20242.webcourse.model;

import com.fasterxml.jackson.databind.annotation.EnumNaming;
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
import web20242.webcourse.model.constant.ERole;
import web20242.webcourse.model.constant.EStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "username")
    private String username;

    @Field(name = "password")
    private String password;

    @Field(name = "role")
    private ERole role; // "ADMIN", "TEACHER", "USER"

    @Field(name = "first_name")
    private String firstName;

    @Field(name = "last_name")
    private String lastName;

    @Field(name = "email")
    private String email;

    @Field(name = "phone")
    private String phone;

    @Field(name = "date_of_birth", targetType = FieldType.DATE_TIME)
    private LocalDate dateOfBirth;

    @Field(name = "gender")
    private String gender;

    @Field(name="requested_courses")
    private ArrayList<ObjectId> requestedCourses; // Danh sách khóa học đã yêu cầu

    @Field(name = "status")
    private EStatus status; // "ACTIVE", "INACTIVE"

    @Field(name = "profile_image")
    private String profileImage; // URL ảnh

    @Field(name = "courses_enrolled")
    private ArrayList<ObjectId> coursesEnrolled;

    @Field(name = "created_at", targetType = FieldType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Field(name = "updated_at", targetType = FieldType.TIMESTAMP)
    private LocalDateTime updatedAt;
}