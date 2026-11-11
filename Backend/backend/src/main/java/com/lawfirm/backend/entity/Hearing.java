
package com.lawfirm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hearings")
public class Hearing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hearing_id")
    private Integer hearingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case legalCase;

    @Column(name = "hearing_date", nullable = false)
    private LocalDateTime hearingDate;

    @Column(name = "court_name", length = 150)
    private String courtName;

    @Column(name = "courtroom", length = 100)
    private String courtroom;

    @Column(name = "purpose", columnDefinition = "TEXT")
    private String purpose;

    @Column(name = "outcome", columnDefinition = "TEXT")
    private String outcome;

    @Column(name = "status", length = 50)
    private String status = "Scheduled";

    public Hearing() {
    }

    public Integer getHearingId() {
        return hearingId;
    }

    public void setHearingId(Integer hearingId) {
        this.hearingId = hearingId;
    }

    public Case getLegalCase() {
        return legalCase;
    }

    public void setLegalCase(Case legalCase) {
        this.legalCase = legalCase;
    }

    public LocalDateTime getHearingDate() {
        return hearingDate;
    }

    public void setHearingDate(LocalDateTime hearingDate) {
        this.hearingDate = hearingDate;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getCourtroom() {
        return courtroom;
    }

    public void setCourtroom(String courtroom) {
        this.courtroom = courtroom;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
