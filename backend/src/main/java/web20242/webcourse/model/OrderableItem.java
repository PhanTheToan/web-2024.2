package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderableItem {
    private Object type; // "LESSON" hoặc "QUIZ"
    private ObjectId id;
    private Integer order;
    private Object entity; // Lesson hoặc Quizzes
}
