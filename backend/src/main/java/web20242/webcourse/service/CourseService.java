package web20242.webcourse.service;

import com.mongodb.client.result.DeleteResult;

import com.mongodb.client.result.UpdateResult;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.Lesson;
import web20242.webcourse.model.Quizzes;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.ECategory;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.LessonRepository;
import web20242.webcourse.repository.QuizzesRepository;
import org.springframework.data.mongodb.core.MongoTemplate;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CourseService {
    @Autowired
    private UserService userService;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private QuizzesRepository quizzesRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

   public ResponseEntity<?> getAllCoursesForLandingPage() {
       List<Course> allCourses = courseRepository.findAll();
       List<Map<String, Object>> courseOverviews = allCourses.stream()
           .map(course -> {
               Map<String, Object> overview = new HashMap<>();
               overview.put("id", String.valueOf(course.getId()));
               overview.put("title", course.getTitle());

               User userTeacher = userService.findById(String.valueOf(course.getTeacherId()));
               if(userTeacher==null){
                    String firstName = "Unknown";
                    String lastName = "Teacher";
                   overview.put("teacherFullName", (firstName +" "+ lastName));
               }else{
                   String firstName = userTeacher.getFirstName();
                   String lastName = userTeacher.getLastName();
                   overview.put("teacherFullName", (firstName +" "+ lastName));
               }
               overview.put("teacherId", String.valueOf(course.getTeacherId()));
               overview.put("description", course.getDescription());
               overview.put("categories", course.getCategories());
               overview.put("thumbnail", course.getThumbnail());
               overview.put("price", course.getPrice());
               overview.put("studentsCount", course.getStudentsEnrolled() != null ?
                            course.getStudentsEnrolled().size() : 0);
               overview.put("contentCount",
                           (course.getLessons() != null ? course.getLessons().size() : 0) +
                           (course.getQuizzes() != null ? course.getQuizzes().size() : 0));
               int totalTimeLimit = 0;
               if(course.getLessons() != null && !course.getLessons().isEmpty()) {
                   for(ObjectId id : course.getLessons()) {
                       Lesson lesson = lessonRepository.findById(id).orElse(null);
                       if(lesson != null && lesson.getTimeLimit() != null) {
                           totalTimeLimit += lesson.getTimeLimit();
                       }
                   }
               }
               if(course.getQuizzes() != null && !course.getQuizzes().isEmpty()) {
                   for(ObjectId id : course.getQuizzes()) {
                       Quizzes quizzes = quizzesRepository.findById(id).orElse(null);
                       if(quizzes != null && quizzes.getTimeLimit() != null) {
                           totalTimeLimit += quizzes.getTimeLimit();
                       }
                   }
               }
                overview.put("totalTimeLimit", totalTimeLimit);
               return overview;
           })
           .collect(Collectors.toList());

       return ResponseEntity.ok(courseOverviews);
   }
//
//    public ResponseEntity<?> updateCategoryNames() {
//        try {
//            long totalUpdated = 0;
//
//            // Cập nhật "FINANCE & ACCOUNTING" thành "FINANCE"
//            Query financeQuery = new Query(Criteria.where("categories").is("FINANCE & ACCOUNTING"));
//            Update financeUpdate = new Update().set("categories.$", ECategory.FINANCE.name());
//            UpdateResult financeResult = mongoTemplate.updateMulti(financeQuery, financeUpdate, "courses");
//            totalUpdated += financeResult.getModifiedCount();
//
//            // Cập nhật "IT & SOFTWARE" thành "IT"
//            Query itQuery = new Query(Criteria.where("categories").is("IT & SOFTWARE"));
//            Update itUpdate = new Update().set("categories.$", ECategory.IT.name());
//            UpdateResult itResult = mongoTemplate.updateMulti(itQuery, itUpdate, "courses");
//            totalUpdated += itResult.getModifiedCount();
//
//            // Cập nhật "PHOTOGRAPHY & VIDEO" thành "PHOTOGRAPHY"
//            Query photoQuery = new Query(Criteria.where("categories").is("PHOTOGRAPHY & VIDEO"));
//            Update photoUpdate = new Update().set("categories.$", ECategory.PHOTOGRAPHY.name());
//            UpdateResult photoResult = mongoTemplate.updateMulti(photoQuery, photoUpdate, "courses");
//            totalUpdated += photoResult.getModifiedCount();
//
//            return ResponseEntity.ok(Map.of(
//                    "message", "Successfully updated category names",
//                    "updatedCount", totalUpdated,
//                    "details", Map.of(
//                            "FINANCE & ACCOUNTING", financeResult.getModifiedCount(),
//                            "IT & SOFTWARE", itResult.getModifiedCount(),
//                            "PHOTOGRAPHY & VIDEO", photoResult.getModifiedCount()
//                    )
//            ));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", e.getMessage()));
//        }
//    }
}
