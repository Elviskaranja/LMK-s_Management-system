package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    @Query("SELECT p FROM Payment p "
            + "LEFT JOIN p.legalCase paymentCase "
            + "LEFT JOIN p.invoice invoice "
            + "LEFT JOIN invoice.legalCase invoiceCase "
            + "WHERE paymentCase.caseId = :caseId OR invoiceCase.caseId = :caseId")
    List<Payment> findByCaseId(@Param("caseId") Integer caseId);

    @Query("SELECT p FROM Payment p WHERE p.invoice.invoiceId = :invoiceId ORDER BY p.paymentDate ASC, p.paymentId ASC")
    List<Payment> findByInvoiceId(@Param("invoiceId") Integer invoiceId);

    boolean existsByInvoiceInvoiceId(Integer invoiceId);

    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM Payment p")
    BigDecimal sumAllPayments();

    @Query("SELECT COUNT(p) FROM Payment p")
    long countAllPayments();
}