package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.service.UserService;
import com.devbuild.gestionauth.repository.RoleRequestRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminApiController {

    private final UserService userService;
    private final RoleRequestRepository roleRequestRepository;

    public AdminApiController(UserService userService, RoleRequestRepository roleRequestRepository) {
        this.userService = userService;
        this.roleRequestRepository = roleRequestRepository;
    }

    // NOTE: AdminRestController already exposes /api/admin/users. To avoid duplicate mappings
    // this endpoint exposes a compact summary at /api/admin/users/summary which is suitable
    // for lightweight admin UIs that only need basic info.
    @GetMapping("/users/summary")
    public List<Map<String, Object>> getUsersSummary() {
        List<User> users = userService.findAllUsers();
        return users.stream().map(u -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", u.getId());
            m.put("email", u.getEmail());
            m.put("firstName", u.getFirstName());
            m.put("lastName", u.getLastName());
            m.put("role", u.getRoles() != null ? u.getRoles().toString() : "");
            m.put("requestedProfile", u.getRequestedProfile() != null ? u.getRequestedProfile() : "");
            return m;
        }).collect(Collectors.toList());
    }
}
