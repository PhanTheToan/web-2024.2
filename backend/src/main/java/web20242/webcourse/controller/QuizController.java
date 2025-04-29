package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.Quizzes;
import web20242.webcourse.model.constant.EQuestion;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.QuizzesRepository;
import web20242.webcourse.service.FileService;
import web20242.webcourse.service.QuizGenerationService;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final FileService fileService;
    private final QuizGenerationService quizGenerationService;
    private final QuizzesRepository quizRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public QuizController(FileService fileService, QuizGenerationService quizGenerationService, QuizzesRepository quizRepository, CourseRepository courseRepository) {
        this.fileService = fileService;
        this.quizGenerationService = quizGenerationService;
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @PostMapping("/generate-from-pdf")
    public ResponseEntity<List<Quizzes>> generateQuizFromPdf(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("courseId") String courseId, // Thêm courseId
            @RequestParam("type") EQuestion type
    ) throws IOException, NoSuchAlgorithmException {
        List<Quizzes> quizzes = new ArrayList<>();
        ObjectId courseObjectId = new ObjectId(courseId); // Chuyển String thành ObjectId

        for (MultipartFile file : files) {
            if (!isPdfFile(file)) {
                throw new IllegalArgumentException("Only PDF files are allowed");
            }
            String pdfUrl = fileService.uploadFileR2(file);

            // Tạo quiz từ URL và gán courseId
            String geminiResponse = quizGenerationService.generateQuizFromPdfUrl(pdfUrl);
            Quizzes quiz = quizGenerationService.parseQuizFromResponse(geminiResponse);
            quiz.setCourseId(courseObjectId); // Gán courseId cho quiz

            // Lưu quiz vào MongoDB
            quiz.setEQuiz(type);
            quizRepository.save(quiz);

            // Cập nhật course với quiz mới
            updateCourseWithQuiz(courseObjectId, quiz.getId());

            quizzes.add(quiz);
        }

        return ResponseEntity.ok(quizzes);
    }
//    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
//    @PutMapping("/fill-full")
//    public void updateType(){
//        List<Quizzes> quizzes = quizRepository.findAll();
//        quizzes.forEach(quizzes1 -> {
//            quizzes1.setEQuiz(EQuestion.QUIZ_FORM_FULL);
//            quizzes1.setMaterial("nothing");
//            quizRepository.save(quizzes1);
//        });
//    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @PostMapping("/generate-from-pdf-thpt")
    public ResponseEntity<List<Quizzes>> generateQuizFromPdfThpt(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("courseId") String courseId // Thêm courseId
    ) throws IOException, NoSuchAlgorithmException {
        List<Quizzes> quizzes = new ArrayList<>();
        ObjectId courseObjectId = new ObjectId(courseId); // Chuyển String thành ObjectId

        for (MultipartFile file : files) {
            if (!isPdfFile(file)) {
                throw new IllegalArgumentException("Only PDF files are allowed");
            }
            String pdfUrl = fileService.uploadFileR2(file);

            // Tạo quiz từ URL và gán courseId
            String geminiResponse = quizGenerationService.generateQuizFromPdfUrlForTHPTQG(pdfUrl);
            Quizzes quiz = quizGenerationService.parseQuizFromResponse(geminiResponse);
            quiz.setCourseId(courseObjectId); // Gán courseId cho quiz

            // Lưu quiz vào MongoDB
            quizRepository.save(quiz);

            // Cập nhật course với quiz mới
            updateCourseWithQuiz(courseObjectId, quiz.getId());

            quizzes.add(quiz);
        }

        return ResponseEntity.ok(quizzes);
    }

    private void updateCourseWithQuiz(ObjectId courseId, ObjectId quizId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        if (course.getQuizzes() == null) {
            course.setQuizzes(new ArrayList<>());
        }
        course.getQuizzes().add(quizId);
        courseRepository.save(course);
    }

    private boolean isPdfFile(MultipartFile file) {
        return file.getContentType() != null && file.getContentType().equals("application/pdf");
    }
}