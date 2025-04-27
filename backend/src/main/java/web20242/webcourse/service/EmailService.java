package web20242.webcourse.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;

    public ResponseEntity<?> sendOtp(String username, String otp, String email) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        String htmlTemplate = null; // Khởi tạo giá trị mặc định hoặc null
        try (InputStream inputStream = new ClassPathResource("templates/mailOtp.hbs").getInputStream()) {
            htmlTemplate = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
            htmlTemplate = htmlTemplate.replace("{{fullName}}", username);
            htmlTemplate = htmlTemplate.replace("{{otpCode}}", otp);
            htmlTemplate = htmlTemplate.replace("{{recipientEmail}}", email);

            helper.setTo(email);

            helper.setSubject("Mã OTP từ Alpha Education");
            helper.setText(htmlTemplate, true);
            helper.setFrom("mclasspart1@gmail.com");

            javaMailSender.send(message);
            return ResponseEntity.ok("Send email success fully");

        } catch (Exception e) {

            throw new MessagingException("Failed to send email: " + e.getMessage(), e);
        }

    }
}
