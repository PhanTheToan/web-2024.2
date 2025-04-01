package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    public ObjectId id;

    @Field(name="category")
    public String category;

    @Field(name="urlLogo")
    public String urlLogo;

    @Field(name="status")
    public boolean status; // True: Popular, False: Normal

    public boolean getStatus() {
        return status;
    }
}
