package web20242.webcourse.model.createRequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.model.constant.EQuestion;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Statistic {
    private ObjectId courseId;
    private ObjectId quizId;
    private String title;
    private ArrayList<StatisticResponseDto> statisticResponseDtos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatisticResponseDto {
        private ObjectId userId;
        private Double score;
        private String fullName;
        private String email;
    }
}
