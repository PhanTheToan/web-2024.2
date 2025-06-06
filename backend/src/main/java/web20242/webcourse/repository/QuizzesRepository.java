package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Quizzes;

import java.util.List;

@Repository
public interface QuizzesRepository extends MongoRepository<Quizzes, ObjectId> {
    List<Quizzes> findByCourseId(ObjectId id);
}
