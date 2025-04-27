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
import web20242.webcourse.model.constant.EImage;

import java.time.LocalDateTime;

@Document(collection = "images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {
    @Id
    private ObjectId id; // _id là ObjectId, MongoDB tự sinh

    @Field(name = "type")
    private EImage type;

    @Field(name = "image_url")
    private String imageUrl; // URL ảnh

    @Field(name = "created_at", targetType = FieldType.TIMESTAMP)
    private LocalDateTime createdAt;
}