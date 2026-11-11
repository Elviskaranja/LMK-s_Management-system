package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Hearing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface HearingRepository extends JpaRepository<Hearing, Integer> {

    // Counts hearings within the requested date range, excluding cancelled hearings.
    @Query("SELECT COUNT(h) FROM Hearing h WHERE h.hearingDate BETWEEN :start AND :end "
            + "AND (h.status IS NULL OR LOWER(h.status) NOT IN ('cancelled', 'canceled'))")
    long countHearingsInRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Retrieves upcoming hearings with their cases and clients, ordered by date.
    @EntityGraph(attributePaths = {"legalCase", "legalCase.client"})
    @Query("SELECT h FROM Hearing h WHERE h.hearingDate >= :now "
            + "AND (h.status IS NULL OR LOWER(h.status) NOT IN ('cancelled', 'canceled')) "
            + "ORDER BY h.hearingDate ASC")
    List<Hearing> findUpcomingHearings(
            @Param("now") LocalDateTime now,
            Pageable pageable);

}