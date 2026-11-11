package com.lawfirm.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DashboardSummaryDTO {

    private final long activeCases;
    private final long totalClients;
    private final long upcomingHearingsCount;
    private final BigDecimal outstandingFees;
    private final long unpaidInvoicesCount;
    private final long overdueInvoicesCount;
    private final List<RecentCaseDTO> recentCases;
    private final List<UpcomingHearingDTO> upcomingHearings;

    public DashboardSummaryDTO(
            long activeCases,
            long totalClients,
            long upcomingHearingsCount,
            BigDecimal outstandingFees,
            long unpaidInvoicesCount,
            long overdueInvoicesCount,
            List<RecentCaseDTO> recentCases,
            List<UpcomingHearingDTO> upcomingHearings) {
        this.activeCases = activeCases;
        this.totalClients = totalClients;
        this.upcomingHearingsCount = upcomingHearingsCount;
        this.outstandingFees = outstandingFees;
        this.unpaidInvoicesCount = unpaidInvoicesCount;
        this.overdueInvoicesCount = overdueInvoicesCount;
        this.recentCases = recentCases;
        this.upcomingHearings = upcomingHearings;
    }

    public long getActiveCases() {
        return activeCases;
    }

    public long getTotalClients() {
        return totalClients;
    }

    public long getUpcomingHearingsCount() {
        return upcomingHearingsCount;
    }

    public BigDecimal getOutstandingFees() {
        return outstandingFees;
    }

    public long getUnpaidInvoicesCount() {
        return unpaidInvoicesCount;
    }

    public long getOverdueInvoicesCount() {
        return overdueInvoicesCount;
    }

    public List<RecentCaseDTO> getRecentCases() {
        return recentCases;
    }

    public List<UpcomingHearingDTO> getUpcomingHearings() {
        return upcomingHearings;
    }

    public static class RecentCaseDTO {

        private final Integer id;
        private final String caseNumber;
        private final String title;
        private final String clientName;
        private final String caseType;
        private final String status;
        private final LocalDateTime nextHearingDate;

        public RecentCaseDTO(
                Integer id,
                String caseNumber,
                String title,
                String clientName,
                String caseType,
                String status,
                LocalDateTime nextHearingDate) {
            this.id = id;
            this.caseNumber = caseNumber;
            this.title = title;
            this.clientName = clientName;
            this.caseType = caseType;
            this.status = status;
            this.nextHearingDate = nextHearingDate;
        }

        public Integer getId() {
            return id;
        }

        public String getCaseNumber() {
            return caseNumber;
        }

        public String getTitle() {
            return title;
        }

        public String getClientName() {
            return clientName;
        }

        public String getCaseType() {
            return caseType;
        }

        public String getStatus() {
            return status;
        }

        public LocalDateTime getNextHearingDate() {
            return nextHearingDate;
        }
    }

    public static class UpcomingHearingDTO {

        private final Integer id;
        private final String caseTitle;
        private final String clientName;
        private final String courtName;
        private final LocalDateTime hearingDateTime;

        public UpcomingHearingDTO(
                Integer id,
                String caseTitle,
                String clientName,
                String courtName,
                LocalDateTime hearingDateTime) {
            this.id = id;
            this.caseTitle = caseTitle;
            this.clientName = clientName;
            this.courtName = courtName;
            this.hearingDateTime = hearingDateTime;
        }

        public Integer getId() {
            return id;
        }

        public String getCaseTitle() {
            return caseTitle;
        }

        public String getClientName() {
            return clientName;
        }

        public String getCourtName() {
            return courtName;
        }

        public LocalDateTime getHearingDateTime() {
            return hearingDateTime;
        }
    }
}
