package com.devbuild.gestionauth.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    private Set<Role> roles = new HashSet<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    @Column(nullable = true)
    private String firstName;

    @Column(nullable = true)
    private String lastName;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private Boolean acceptTerms = false;

    @Column(nullable = true)
    private String requestedProfile;

    @Column(nullable = false)
    private Boolean approved = false;

    @Column(nullable = true)
    private String affiliation;

    @Column(name = "email_verification_token", nullable = true)
    private String emailVerificationToken;

    @Column(name = "verification_code", nullable = true)
    private String verificationCode;

    @Column(name = "verification_expiry", nullable = true)
    private java.time.LocalDateTime verificationExpiry;

    @Column(name = "verification_sent_at", nullable = true)
    private java.time.LocalDateTime verificationSentAt;

    @Column(name = "verification_send_count", nullable = true)
    private Integer verificationSendCount = 0;

    @Column(name = "verification_send_count_reset", nullable = true)
    private java.time.LocalDateTime verificationSendCountReset;


    @Column(nullable = true)
    private String approvedBy;

    @Column(nullable = true)
    private java.time.LocalDateTime approvedAt;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(nullable = true)
    private String rejectionReason;

    @Column(nullable = false)
    private Boolean disabled = false;

    @Column(name = "password_reset_token_hash", nullable = true)
    private String passwordResetTokenHash;

    @Column(name = "password_reset_expiry", nullable = true)
    private java.time.LocalDateTime passwordResetExpiry;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Boolean getAcceptTerms() { return acceptTerms; }
    public void setAcceptTerms(Boolean acceptTerms) { this.acceptTerms = acceptTerms; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public String getRequestedProfile() { return requestedProfile; }
    public void setRequestedProfile(String requestedProfile) { this.requestedProfile = requestedProfile; }
    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }
    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getAffiliation() { return affiliation; }
    public void setAffiliation(String affiliation) { this.affiliation = affiliation; }
    public String getEmailVerificationToken() { return emailVerificationToken; }
    public void setEmailVerificationToken(String emailVerificationToken) { this.emailVerificationToken = emailVerificationToken; }
    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    public java.time.LocalDateTime getVerificationExpiry() { return verificationExpiry; }
    public void setVerificationExpiry(java.time.LocalDateTime verificationExpiry) { this.verificationExpiry = verificationExpiry; }
    public java.time.LocalDateTime getVerificationSentAt() { return verificationSentAt; }
    public void setVerificationSentAt(java.time.LocalDateTime verificationSentAt) { this.verificationSentAt = verificationSentAt; }
    public Integer getVerificationSendCount() { return verificationSendCount; }
    public void setVerificationSendCount(Integer verificationSendCount) { this.verificationSendCount = verificationSendCount; }
    public java.time.LocalDateTime getVerificationSendCountReset() { return verificationSendCountReset; }
    public void setVerificationSendCountReset(java.time.LocalDateTime verificationSendCountReset) { this.verificationSendCountReset = verificationSendCountReset; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public java.time.LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(java.time.LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public Boolean getDisabled() { return disabled; }
    public void setDisabled(Boolean disabled) { this.disabled = disabled; }

    public String getPasswordResetTokenHash() { return passwordResetTokenHash; }
    public void setPasswordResetTokenHash(String passwordResetTokenHash) { this.passwordResetTokenHash = passwordResetTokenHash; }

    public java.time.LocalDateTime getPasswordResetExpiry() { return passwordResetExpiry; }
    public void setPasswordResetExpiry(java.time.LocalDateTime passwordResetExpiry) { this.passwordResetExpiry = passwordResetExpiry; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}
