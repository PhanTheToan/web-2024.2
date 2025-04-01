package web20242.webcourse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseFilterRequest {
    private List<String> categories;
    private List<Double> ratings;
    private List<String> teacherIds;
    private String priceFilter;
}
