package com.lawfirm.backend.service;

import com.lawfirm.backend.dto.DashboardSummaryDTO;
import com.lawfirm.backend.entity.Case;
import com.lawfirm.backend.entity.Hearing;
import com.lawfirm.backend.repository.CaseRepository;
import com.lawfirm.backend.repository.ClientRepository;
import com.lawfirm.backend.repository.HearingRepository;
import com.lawfirm.backend.repository.InvoiceRepository;
import com.lawfirm.backend.repository.PaymentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CaseRepository caseRepository;
    private final ClientRepository clientRepository;
    private final HearingRepository hearingRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(
            CaseRepository caseRepository,
            ClientRepository clientRepository,
            HearingRepository hearingRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository) {
        this.caseRepository = caseRepository;
        this.clientRepository = clientRepository;
        this.hearingRepository = hearingRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfRange = today.plusDays(7).atTime(LocalTime.MAX);
        LocalDateTime now = LocalDateTime.now();

        long activeCases = caseRepository.countActiveCases();
        long totalClients = clientRepository.countAllClients();
        long upcomingHearingsCount =
                hearingRepository.countHearingsInRange(startOfToday, endOfRange);

        BigDecimal outstandingFees = invoiceRepository.sumUnpaidInvoiceAmounts()
                .subtract(paymentRepository.sumPaymentsForUnpaidInvoices())
                .max(BigDecimal.ZERO);

        List<Case> recentCases = caseRepository.findTop5ByOrderByCreatedAtDesc();
        Map<Integer, LocalDateTime> nextHearingDates = recentCases.isEmpty()
                ? Map.of()
                : caseRepository.findNextHearingDates(
                        recentCases.stream().map(Case::getCaseId).toList(),
                        now)
                        .stream()
                        .collect(Collectors.toMap(
                                CaseRepository.NextHearingDateProjection::getCaseId,
                                CaseRepository.NextHearingDateProjection::getNextHearingDate));

        List<DashboardSummaryDTO.RecentCaseDTO> recentCaseDTOs = recentCases.stream()
                .map(legalCase -> new DashboardSummaryDTO.RecentCaseDTO(
                        legalCase.getCaseId(),
                        legalCase.getCaseNumber(),
                        legalCase.getCaseTitle(),
                        legalCase.getClient().getFullName(),
                        legalCase.getCaseType(),
                        legalCase.getStatus(),
                        nextHearingDates.get(legalCase.getCaseId())))
                .toList();

        List<Hearing> upcomingHearings =
                hearingRepository.findUpcomingHearings(now, PageRequest.of(0, 5));
        List<DashboardSummaryDTO.UpcomingHearingDTO> upcomingHearingDTOs = upcomingHearings
                .stream()
                .map(this::toUpcomingHearingDTO)
                .toList();

        return new DashboardSummaryDTO(
                activeCases,
                totalClients,
                upcomingHearingsCount,
                outstandingFees,
                invoiceRepository.countUnpaidInvoices(),
                invoiceRepository.countOverdueUnpaidInvoices(today),
                recentCaseDTOs,
                upcomingHearingDTOs);
    }

    private DashboardSummaryDTO.UpcomingHearingDTO toUpcomingHearingDTO(Hearing hearing) {
        Case legalCase = hearing.getLegalCase();
        return new DashboardSummaryDTO.UpcomingHearingDTO(
                hearing.getHearingId(),
                legalCase.getCaseTitle(),
                legalCase.getClient().getFullName(),
                hearing.getCourtName(),
                hearing.getHearingDate());
    }
}
