package com.devbuild.gestionauth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_requests")
public class RoleRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role requestedRole;

    @Column(length = 20, nullable = false)
    private String status = "PENDING"; 

    private String affiliation;
    private String justification;
    private String username;
    private String province;
    
    @Column(name = "front_id_path")
    private String frontIdPath;
    
    @Column(name = "back_id_path")
    private String backIdPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;
    
    @Column(name = "review_reason", length = 1000)
    private String reviewReason;

    @Column(name = "notify_by_email")
    private Boolean notifyByEmail = false;

    public RoleRequest() {}

    public RoleRequest(User user, Role requestedRole) {
        this.user = user;
        this.requestedRole = requestedRole;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Role getRequestedRole() { return requestedRole; }
    public void setRequestedRole(Role requestedRole) { this.requestedRole = requestedRole; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAffiliation() { return affiliation; }
    public void setAffiliation(String affiliation) { this.affiliation = affiliation; }

    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getFrontIdPath() { return frontIdPath; }
    public void setFrontIdPath(String frontIdPath) { this.frontIdPath = frontIdPath; }

    public String getBackIdPath() { return backIdPath; }
    public void setBackIdPath(String backIdPath) { this.backIdPath = backIdPath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewReason() { return reviewReason; }
    public void setReviewReason(String reviewReason) { this.reviewReason = reviewReason; }

    public Boolean getNotifyByEmail() { return notifyByEmail; }
    public void setNotifyByEmail(Boolean notifyByEmail) { this.notifyByEmail = notifyByEmail; }
}
