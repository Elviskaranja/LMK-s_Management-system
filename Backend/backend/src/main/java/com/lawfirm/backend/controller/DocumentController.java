
package com.lawfirm.backend.controller;

import com.lawfirm.backend.entity.Document;
import com.lawfirm.backend.service.DocumentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public List<Document> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Integer id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Document> createDocument(
            @RequestBody Document document) {
        Document saved = documentService.saveDocument(document);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Integer id, @RequestBody Document document) {

        if (documentService.getDocumentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        document.setDocumentId(id);
        return ResponseEntity.ok(documentService.saveDocument(document));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Integer id) {
        if (documentService.getDocumentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
