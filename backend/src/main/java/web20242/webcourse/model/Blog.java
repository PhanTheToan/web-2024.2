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
import software.amazon.awssdk.services.s3.endpoints.internal.Value;
import web20242.webcourse.model.constant.EStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Document(collection = "blog")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Blog {

    @Id
    private ObjectId id;

    @Field(name="ownerId")
    private ObjectId ownerId;

    @Field(name="title")
    private String title;

    @Field(name="content")
    private String content;

    @Field(name="author")
    private String author;

    @Field(name="refer")
    private String refer;

    @Field(name="image")
    private String image;

    @Field(name="status")
    private EStatus status;

    @Field(name = "created_at", targetType = FieldType.TIMESTAMP)
    private LocalDateTime createdAt;

}
