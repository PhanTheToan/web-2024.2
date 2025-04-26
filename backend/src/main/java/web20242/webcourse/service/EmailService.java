package web20242.webcourse.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

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

        try {
            String htmlTemplate = new String(Files.readAllBytes(Paths.get("src/main/java/web20242/webcourse/model/template/mailOtp.hbs")), StandardCharsets.UTF_8);

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
