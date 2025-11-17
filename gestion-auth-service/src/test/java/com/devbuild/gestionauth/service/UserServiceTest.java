package com.devbuild.gestionauth.service;

import com.devbuild.gestionauth.model.User;
import com.devbuild.gestionauth.notification.NotificationClient;
import com.devbuild.gestionauth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class UserServiceTest {

    @Test
    public void testCreateUserWithProfile_sendsNotification() {
        UserRepository repo = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        NotificationClient notif = mock(NotificationClient.class);

        when(encoder.encode(any())).thenReturn("hash");
        when(repo.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(notif.sendProfileRequest(any())).thenReturn(reactor.core.publisher.Mono.empty());

        UserService svc = new UserService(repo, encoder, notif);
    User u = svc.createUserWithProfile("a@b", "pwd", "F", "L", "p", true, "ROLE_CANDIDAT", "Uni");

        assertEquals("a@b", u.getEmail());
        verify(notif, times(1)).sendProfileRequest(any());
    }
}
