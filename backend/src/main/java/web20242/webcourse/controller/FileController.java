package web20242.webcourse.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
}