package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Logo;

import java.util.List;
@Repository
public interface LogoRepository extends MongoRepository<Logo, ObjectId> {
}
