
package com.lawfirm.backend.controller;

import com.lawfirm.backend.entity.Case;
import com.lawfirm.backend.service.CaseService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "http://localhost:5173")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    public List<Case> getAllCases() {
        return caseService.getAllCases();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Case> getCaseById(@PathVariable Integer id) {
        return caseService.getCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Case> createCase(@RequestBody Case legalCase) {
        Case saved = caseService.saveCase(legalCase);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Case> updateCase(
            @PathVariable Integer id, @RequestBody Case legalCase) {

        if (caseService.getCaseById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        legalCase.setCaseId(id);
        return ResponseEntity.ok(caseService.saveCase(legalCase));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable Integer id) {
        if (caseService.getCaseById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        caseService.deleteCase(id);
        return ResponseEntity.noContent().build();
    }
}
