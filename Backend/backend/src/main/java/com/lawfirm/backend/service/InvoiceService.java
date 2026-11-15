
package com.lawfirm.backend.service;

import com.lawfirm.backend.entity.Invoice;
import com.lawfirm.backend.entity.Case;
import com.lawfirm.backend.repository.CaseRepository;
import com.lawfirm.backend.repository.InvoiceRepository;
import com.lawfirm.backend.repository.PaymentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CaseRepository caseRepository;
    private final PaymentRepository paymentRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            CaseRepository caseRepository,
            PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.caseRepository = caseRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public List<Invoice> getInvoicesByCaseId(Integer caseId) {
        return invoiceRepository.findByCaseId(caseId);
    }

    public Optional<Invoice> getInvoiceById(Integer id) {
        return invoiceRepository.findById(id);
    }

    @Transactional
    public Invoice saveInvoice(Invoice invoice) {
        if (invoice == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice payload is required.");
        }
        if (invoice.getTotalAmount() == null
                || invoice.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice amount must be greater than zero.");
        }
        if (invoice.getIssueDate() == null || invoice.getDueDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Issue date and due date are required.");
        }
        if (invoice.getDueDate().isBefore(invoice.getIssueDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Due date cannot be before issue date.");
        }
        if (invoice.getLegalCase() == null || invoice.getLegalCase().getCaseId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A registered case is required.");
        }

        Invoice existingInvoice = null;
        if (invoice.getInvoiceId() != null) {
            existingInvoice = invoiceRepository.findById(invoice.getInvoiceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found."));
        }

        Case legalCase = caseRepository.findById(invoice.getLegalCase().getCaseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Case not found."));

        if (existingInvoice != null
                && existingInvoice.getLegalCase() != null
                && !existingInvoice.getLegalCase().getCaseId().equals(legalCase.getCaseId())
                && paymentRepository.existsByInvoiceInvoiceId(existingInvoice.getInvoiceId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "The case cannot be changed after payments have been recorded.");
        }

        String invoiceNumber = invoice.getInvoiceNumber() == null
                ? ""
                : invoice.getInvoiceNumber().trim();
        if (invoiceNumber.isEmpty() && existingInvoice != null) {
            invoiceNumber = existingInvoice.getInvoiceNumber();
        }
        if (invoiceNumber.isEmpty()) {
            invoiceNumber = generateInvoiceNumber();
        }
        if (invoiceNumber.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice number cannot exceed 100 characters.");
        }
        boolean duplicateNumber = existingInvoice == null
                ? invoiceRepository.existsByInvoiceNumber(invoiceNumber)
                : invoiceRepository.existsByInvoiceNumberAndInvoiceIdNot(
                        invoiceNumber, existingInvoice.getInvoiceId());
        if (duplicateNumber) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice number is already in use.");
        }

        BigDecimal totalPaid = existingInvoice == null
                ? BigDecimal.ZERO
                : invoiceRepository.sumPaymentsByInvoiceId(existingInvoice.getInvoiceId());
        if (invoice.getTotalAmount().compareTo(totalPaid) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invoice amount cannot be less than payments already recorded.");
        }

        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setLegalCase(legalCase);
        invoice.setClient(legalCase.getClient());
        invoice.setStatus(resolveStatus(invoice.getTotalAmount(), totalPaid));
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void deleteInvoice(Integer id) {
        if (!invoiceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found.");
        }
        if (paymentRepository.existsByInvoiceInvoiceId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "An invoice with recorded payments cannot be deleted.");
        }
        invoiceRepository.deleteById(id);
    }

    private String generateInvoiceNumber() {
        String invoiceNumber;
        do {
            invoiceNumber = "INV-" + LocalDate.now().getYear() + "-"
                    + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (invoiceRepository.existsByInvoiceNumber(invoiceNumber));
        return invoiceNumber;
    }

    private String resolveStatus(BigDecimal totalAmount, BigDecimal totalPaid) {
        if (totalPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return "Unpaid";
        }
        return totalPaid.compareTo(totalAmount) >= 0 ? "Paid" : "Partially Paid";
    }
}
