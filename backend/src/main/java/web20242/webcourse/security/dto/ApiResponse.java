package web20242.webcourse.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;       // Mã trạng thái HTTP (200, 400, 500, v.v.)
    private String message;   // Thông báo cho client
    private T data;           // Dữ liệu generic (có thể là AuthenticationResponse, User, hoặc null)

    // Constructor tiện lợi cho trường hợp không có data
    public ApiResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.data = null;
    }
}