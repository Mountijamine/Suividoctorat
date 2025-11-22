package com.devbuild.gestionauth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_audit")
public class RoleAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String targetEmail;

    @Column(nullable = false)
    private String roleName;

    @Column(nullable = false)
    private String action; 

    @Column(nullable = false)
    private String performedBy;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 1024)
    private String details;

    public Long getId() { return id; }
    public String getTargetEmail() { return targetEmail; }
    public void setTargetEmail(String targetEmail) { this.targetEmail = targetEmail; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
