package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import web20242.webcourse.model.constant.ECategory;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseFilterRequest {
    private List<ECategory> categories;
    private List<Double> ratings;
    private List<String> teacherIds;
    private String priceFilter;
}
