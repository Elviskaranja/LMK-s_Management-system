
package com.lawfirm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "case_advocates")
public class CaseAdvocate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_advocate_id")
    private Integer caseAdvocateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case legalCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advocate_id", nullable = false)
    private Advocate advocate;

    @Column(name = "assigned_at", insertable = false, updatable = false)
    private LocalDateTime assignedAt;

    // Default constructor
    public CaseAdvocate() {
    }

    // Getters and Setters
    public Integer getCaseAdvocateId() {
        return caseAdvocateId;
    }

    public void setCaseAdvocateId(Integer caseAdvocateId) {
        this.caseAdvocateId = caseAdvocateId;
    }

    public Case getLegalCase() {
        return legalCase;
    }

    public void setLegalCase(Case legalCase) {
        this.legalCase = legalCase;
    }

    public Advocate getAdvocate() {
        return advocate;
    }

    public void setAdvocate(Advocate advocate) {
        this.advocate = advocate;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
