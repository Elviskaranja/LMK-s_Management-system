
package com.lawfirm.backend.service;

import com.lawfirm.backend.entity.Invoice;
import com.lawfirm.backend.entity.Payment;
import com.lawfirm.backend.repository.InvoiceRepository;
import com.lawfirm.backend.repository.PaymentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByCaseId(Integer caseId) {
        return paymentRepository.findByCaseId(caseId);
    }

    public List<Payment> getPaymentsByInvoiceId(Integer invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    @Transactional
    public Payment savePayment(Payment payment) {
        if (payment == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment payload is required.");
        }
        if (payment.getInvoice() == null || payment.getInvoice().getInvoiceId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice ID is required.");
        }
        if (payment.getAmount() == null || payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount must be greater than zero.");
        }
        if (payment.getPaymentDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment date is required.");
        }
        if (payment.getPaymentMethod() == null || payment.getPaymentMethod().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is required.");
        }

        Integer previousInvoiceId = payment.getPaymentId() == null
                ? null
                : paymentRepository.findById(payment.getPaymentId())
                        .map(existing -> existing.getInvoice().getInvoiceId())
                        .orElse(null);

        Invoice invoice = invoiceRepository.findById(payment.getInvoice().getInvoiceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Invoice not found."));

        BigDecimal totalPaid = paymentRepository.findByInvoiceId(invoice.getInvoiceId()).stream()
                .filter(existing -> !existing.getPaymentId().equals(payment.getPaymentId()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingAfterThisPayment = invoice.getTotalAmount().subtract(totalPaid).subtract(payment.getAmount());
        if (remainingAfterThisPayment.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment exceeds the outstanding invoice balance.");
        }

        payment.setInvoice(invoice);
        payment.setLegalCase(invoice.getLegalCase());
        Payment saved = paymentRepository.save(payment);
        if (previousInvoiceId != null && !previousInvoiceId.equals(invoice.getInvoiceId())) {
            updateInvoiceStatus(previousInvoiceId);
        }
        updateInvoiceStatus(invoice.getInvoiceId());
        return saved;
    }

    @Transactional
    public void deletePayment(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found."));
        Integer invoiceId = payment.getInvoice().getInvoiceId();
        paymentRepository.delete(payment);
        updateInvoiceStatus(invoiceId);
    }

    @Transactional
    public void updateInvoiceStatus(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found."));

        BigDecimal totalPaid = paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outstanding = invoice.getTotalAmount().subtract(totalPaid).max(BigDecimal.ZERO);

        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus("Unpaid");
        } else if (outstanding.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus("Paid");
        } else {
            invoice.setStatus("Partially Paid");
        }
        invoiceRepository.save(invoice);
    }
}
