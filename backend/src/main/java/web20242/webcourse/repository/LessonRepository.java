package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Course;
import  web20242.webcourse.model.Lesson;

import java.util.List;

@Repository
public interface LessonRepository extends MongoRepository<Lesson, ObjectId> {
    List<Lesson> findByCourseId(ObjectId courseId);
}
