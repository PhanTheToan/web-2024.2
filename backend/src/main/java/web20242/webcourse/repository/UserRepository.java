package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.ERole;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, ObjectId> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    List<User> findByCoursesEnrolled(ObjectId id);

    List<User> findByRole(ERole eRole);
}
