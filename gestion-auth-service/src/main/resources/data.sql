INSERT INTO users (id, email, password, first_name, last_name, accept_terms) VALUES (1, 'admin@local', '$2a$10$7QbGgk6s8XkQG6Qxq1N3CO5l8y6Z8gIYkOq6yQ2v8P7k9b6nE5u6', 'Admin', 'User', true);
INSERT INTO user_roles (user_id, roles) VALUES (1, 'ROLE_ADMIN');
