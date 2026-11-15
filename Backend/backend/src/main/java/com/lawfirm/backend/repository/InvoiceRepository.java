package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    @Override
    @EntityGraph(attributePaths = {"client", "legalCase", "legalCase.client"})
    List<Invoice> findAll();

    @Override
    @EntityGraph(attributePaths = {"client", "legalCase", "legalCase.client"})
    Optional<Invoice> findById(Integer id);

    // Counts unpaid invoices.
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'Unpaid'")
    long countUnpaidInvoices();

    // Counts unpaid invoices with a due date before today.
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'Unpaid' AND i.dueDate < :today")
    long countOverdueUnpaidInvoices(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0.00) FROM Invoice i")
    BigDecimal sumTotalInvoiceAmounts();

    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM Payment p WHERE p.invoice.invoiceId = :invoiceId")
    BigDecimal sumPaymentsByInvoiceId(@Param("invoiceId") Integer invoiceId);

    @EntityGraph(attributePaths = {"client", "legalCase", "legalCase.client"})
    @Query("SELECT i FROM Invoice i WHERE i.legalCase.caseId = :caseId ORDER BY i.invoiceId ASC")
    List<Invoice> findByCaseId(@Param("caseId") Integer caseId);

    boolean existsByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumberAndInvoiceIdNot(String invoiceNumber, Integer invoiceId);

    @Query(value = """
            SELECT COALESCE(SUM(GREATEST(i.total_amount - COALESCE(p.total_paid, 0), 0)), 0)
            FROM invoices i
            LEFT JOIN (
                SELECT invoice_id, SUM(amount) AS total_paid
                FROM payments
                GROUP BY invoice_id
            ) p ON p.invoice_id = i.invoice_id
            """, nativeQuery = true)
    BigDecimal sumOutstandingBalancesAcrossInvoices();
}