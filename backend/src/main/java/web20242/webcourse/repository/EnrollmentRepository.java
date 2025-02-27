package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Enrollment;

import java.util.List;

@Repository
public interface EnrollmentRepository extends MongoRepository<Enrollment, ObjectId> {
    List<Enrollment> findByUserId(ObjectId userId);
    List<Enrollment> findByCourseId(ObjectId courseId);
    List<Enrollment> findByStatus(String status);
    Enrollment findByUserIdAndCourseId(ObjectId userId, ObjectId courseId);
}
