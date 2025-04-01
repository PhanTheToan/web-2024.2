package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.constant.ECategory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends MongoRepository<Course, ObjectId> {
    ArrayList<Course> findByCategoriesIn(List<ECategory> finance);
}
