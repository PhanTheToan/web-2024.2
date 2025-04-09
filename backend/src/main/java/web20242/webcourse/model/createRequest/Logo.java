package web20242.webcourse.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "logos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Logo {
    @Id
    private ObjectId id;

    @Field(name="url")
    private String url;
}
