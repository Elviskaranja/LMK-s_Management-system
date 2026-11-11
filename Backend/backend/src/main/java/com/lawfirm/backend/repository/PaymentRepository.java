package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    // Sums payments applied to unpaid invoices.
    @Query("SELECT COALESCE(SUM(p.amount), 0.00) FROM Payment p WHERE p.invoice.status = 'Unpaid'")
    BigDecimal sumPaymentsForUnpaidInvoices();
}