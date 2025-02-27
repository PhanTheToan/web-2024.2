package web20242.webcourse.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import web20242.webcourse.security.dto.AuthenticationRequest;
import web20242.webcourse.security.dto.AuthenticationResponse;
import web20242.webcourse.security.service.JwtService;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            String jwtToken = jwtService.generateToken(userDetails);
            return new AuthenticationResponse(jwtToken);
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Đăng nhập thất bại: Sai username hoặc password");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi server khi xác thực: " + e.getMessage(), e);
        }
    }
}