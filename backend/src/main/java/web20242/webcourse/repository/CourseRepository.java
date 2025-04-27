package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.constant.EStatus;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, ObjectId> {
    ArrayList<Course> findByCategoriesIn(List<String> finance);

    @Query("""
{
    $and: [
        { $or: [ { 'categories': { $all: ?0 } }, { ?0 : {$exists: false} } ] },
        { $or: [ { 'teacherId': { $in: ?2 } }, { ?2 : {$exists: false} } ] },
        { 'price': { $gte: ?3, $lte: ?4 } },
        { $or: [ 
            { 'averageRating': { $in: ?1 } }, 
            { ?1 : {$exists: false} } 
        ]}
    ]
}
""")
    List<Course> findByFilters(
            List<String> categories,
            List<Double> ratings,
            List<ObjectId> teacherIds,
            double minPrice,
            double maxPrice
    );


    Page<Course> findByStatus(EStatus eStatus, Pageable pageable);

    @Query("{ 'title': { $regex: ?0, $options: 'i' }, 'status': ?1 }")
    Page<Course> findByTitleContainingIgnoreCaseAndStatus(String title, EStatus status, Pageable pageable);

    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    Page<Course> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Lọc theo danh mục, đánh giá, giảng viên
    @Query("{ 'categories': { $in: ?0 }, 'averageRating': { $gte: ?1, $lte: ?2 }, 'teacherId': { $in: ?3 }, 'status': 'ACTIVE' }")
    Page<Course> findByCategoriesAndRatingAndTeacherIds(
            List<String> categories,
            Double ratingMin,
            Double ratingMax,
            List<ObjectId> teacherIds,
            Pageable pageable
    );

    // Lọc theo danh mục và đánh giá
    @Query("{ 'categories': { $in: ?0 }, 'averageRating': { $gte: ?1, $lte: ?2 }, 'status': 'ACTIVE' }")
    Page<Course> findByCategoriesAndRating(
            List<String> categories,
            Double ratingMin,
            Double ratingMax,
            Pageable pageable
    );

    // Lọc theo danh mục và giảng viên
    @Query("{ 'categories': { $in: ?0 }, 'teacherId': { $in: ?1 }, 'status': 'ACTIVE' }")
    Page<Course> findByCategoriesAndTeacherIds(
            List<String> categories,
            List<ObjectId> teacherIds,
            Pageable pageable
    );

    // Lọc theo đánh giá và giảng viên
    @Query("{ 'averageRating': { $gte: ?0, $lte: ?1 }, 'teacherId': { $in: ?2 }, 'status': 'ACTIVE' }")
    Page<Course> findByRatingAndTeacherIds(
            Double ratingMin,
            Double ratingMax,
            List<ObjectId> teacherIds,
            Pageable pageable
    );

    // Lọc theo danh mục
    @Query("{ 'categories': { $in: ?0 }, 'status': 'ACTIVE' }")
    Page<Course> findByCategories(List<String> categories, Pageable pageable);

    // Lọc theo đánh giá
    @Query("{ 'averageRating': { $gte: ?0, $lte: ?1 }, 'status': 'ACTIVE' }")
    Page<Course> findByRating(Double ratingMin, Double ratingMax, Pageable pageable);

    // Lọc theo giảng viên
    @Query("{ 'teacherId': { $in: ?0 }, 'status': 'ACTIVE' }")
    Page<Course> findByTeacherIds(List<ObjectId> teacherIds, Pageable pageable);
}
