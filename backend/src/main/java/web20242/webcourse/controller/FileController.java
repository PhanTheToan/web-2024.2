package web20242.webcourse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web20242.webcourse.model.Logo;
import web20242.webcourse.service.FileService;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/api/upload")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @PostMapping("/image")
    public String uploadFile(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "altText", required = false) String altText
    ) throws IOException, NoSuchAlgorithmException {
        return fileService.uploadFile(file, type, altText);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @PostMapping("/image/r2")
    public String uploadFileR2(
            @RequestParam("image") MultipartFile file
    ) throws IOException, NoSuchAlgorithmException {
        return fileService.uploadFileR2(file);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/image/{id}")
    public void deleteFile(@PathVariable("id") String imageId) {
        fileService.deleteFile(imageId);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/image/by-url")
    public ResponseEntity<String> deleteFileByUrl(@RequestParam("imageUrl") String imageUrl) {
        fileService.deleteFileByUrl(imageUrl);
        return ResponseEntity.ok("Image with URL " + imageUrl + " deleted successfully");
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFileOnR2(@RequestParam("fileUrl") String fileUrl) {
        fileService.deleteFileOnR2ByUrl(fileUrl);
        return ResponseEntity.ok("File with URL " + fileUrl + " deleted from R2 successfully");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleNotFound(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @PostMapping("/pdf")
    public String uploadPdfToR2(
            @RequestParam("file") MultipartFile file
    ) throws IOException, NoSuchAlgorithmException {
        if (!isPdfFile(file)) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
        return fileService.uploadFileR2(file);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/logo")
    public String uploadLogo(
            @RequestParam("logo") MultipartFile file
    ) throws IOException, NoSuchAlgorithmException {
        return fileService.uploadFileR2(file);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/upLogo")
    public ResponseEntity<?> upLogo(@RequestBody Logo logo){
        return ResponseEntity.ok(fileService.upLogo(logo));
    }

//    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
//    @PostMapping("/video")
//    public String uploadVideoToR2(
//            @RequestParam("file") MultipartFile file
//    ) throws IOException, NoSuchAlgorithmException {
//        if (!isPdfFile(file)) {
//            throw new IllegalArgumentException("Only PDF files are allowed");
//        }
//        return fileService.uploadFileR2(file);
//    }

    private boolean isPdfFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.equals("application/pdf");
    }

}