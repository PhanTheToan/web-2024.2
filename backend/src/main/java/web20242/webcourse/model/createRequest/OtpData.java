package web20242.webcourse.model.createRequest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import web20242.webcourse.model.User;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpData {
    private static final long OTP_EXPIRY_MINUTES = 5;
    String otp;
    User user;
    LocalDateTime expiryTime;

    public OtpData(String otp, User user) {
        this.otp = otp;
        this.user = user;
        this.expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
}
