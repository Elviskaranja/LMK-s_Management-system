
package com.lawfirm.backend.controller;

import com.lawfirm.backend.entity.Invoice;
import com.lawfirm.backend.service.InvoiceService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Integer id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        Invoice saved = invoiceService.saveInvoice(invoice);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(
            @PathVariable Integer id, @RequestBody Invoice invoice) {

        if (invoiceService.getInvoiceById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        invoice.setInvoiceId(id);
        return ResponseEntity.ok(invoiceService.saveInvoice(invoice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Integer id) {
        if (invoiceService.getInvoiceById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
