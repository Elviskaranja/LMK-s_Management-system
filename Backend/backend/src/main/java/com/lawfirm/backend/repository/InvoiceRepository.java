package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    // Counts unpaid invoices.
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'Unpaid'")
    long countUnpaidInvoices();

    // Counts unpaid invoices with a due date before today.
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'Unpaid' AND i.dueDate < :today")
    long countOverdueUnpaidInvoices(@Param("today") LocalDate today);

    // Sums the total amounts on unpaid invoices.
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0.00) FROM Invoice i WHERE i.status = 'Unpaid'")
    BigDecimal sumUnpaidInvoiceAmounts();
}