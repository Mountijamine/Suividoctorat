package com.devbuild.notification.repository;

import com.devbuild.notification.model.EmailTemplate;

import java.util.Optional;

public interface EmailTemplateRepository {
    Optional<EmailTemplate> findByCode(String code);
}
