package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Case;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CaseRepository extends JpaRepository<Case, Integer> {

    // Counts cases whose status is not the existing terminal status, Closed.
    @Query("SELECT COUNT(c) FROM Case c WHERE c.status IS NULL OR LOWER(c.status) <> 'closed'")
    long countActiveCases();

    // Retrieves the five newest cases with their clients to avoid lazy-load queries per case.
    @EntityGraph(attributePaths = "client")
    List<Case> findTop5ByOrderByCreatedAtDesc();

    // Finds the next non-cancelled hearing date for each requested case.
    @Query("SELECT h.legalCase.caseId AS caseId, MIN(h.hearingDate) AS nextHearingDate "
            + "FROM Hearing h WHERE h.legalCase.caseId IN :caseIds AND h.hearingDate >= :now "
            + "AND (h.status IS NULL OR LOWER(h.status) NOT IN ('cancelled', 'canceled')) "
            + "GROUP BY h.legalCase.caseId")
    List<NextHearingDateProjection> findNextHearingDates(
            @Param("caseIds") List<Integer> caseIds,
            @Param("now") LocalDateTime now);

    interface NextHearingDateProjection {
        Integer getCaseId();

        LocalDateTime getNextHearingDate();
    }
}
