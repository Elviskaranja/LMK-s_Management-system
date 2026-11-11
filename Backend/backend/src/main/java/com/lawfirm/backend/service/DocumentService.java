
package com.lawfirm.backend.service;

import com.lawfirm.backend.entity.Document;
import com.lawfirm.backend.repository.DocumentRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Optional<Document> getDocumentById(Integer id) {
        return documentRepository.findById(id);
    }

    public Document saveDocument(Document document) {
        return documentRepository.save(document);
    }

    public void deleteDocument(Integer id) {
        documentRepository.deleteById(id);
    }
}
