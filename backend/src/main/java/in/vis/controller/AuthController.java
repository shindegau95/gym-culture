package in.vis.controller;

import in.vis.dto.RegisterRequest;
import in.vis.dto.UserResponse;
import in.vis.enums.Role;
import in.vis.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal String firebaseUid) {
        return userService.getByFirebaseUid(firebaseUid);
    }

    @PostMapping("/register")
    public UserResponse register(@AuthenticationPrincipal String firebaseUid,
                                 @RequestParam Role role,
                                 @RequestParam(required = false) Long branchId,
                                 @Valid @RequestBody RegisterRequest body) {
        return userService.registerUser(firebaseUid, body, role, branchId);
    }
}
