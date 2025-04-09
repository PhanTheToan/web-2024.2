package web20242.webcourse.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import web20242.webcourse.model.constant.EStatus;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCreateRequest {
    private String title;
    private String description;
    private String thumbnail;
    private String price;
    private EStatus status;
    private List<String> categories;
    private String teacherId;
}
