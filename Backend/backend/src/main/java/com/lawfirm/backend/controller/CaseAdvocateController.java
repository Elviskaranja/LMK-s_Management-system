
package com.lawfirm.backend.controller;

import com.lawfirm.backend.entity.CaseAdvocate;
import com.lawfirm.backend.service.CaseAdvocateService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/case-advocates")
@CrossOrigin(origins = "http://localhost:5173")
public class CaseAdvocateController {

    private final CaseAdvocateService caseAdvocateService;

    public CaseAdvocateController(CaseAdvocateService caseAdvocateService) {
        this.caseAdvocateService = caseAdvocateService;
    }

    @GetMapping
    public List<CaseAdvocate> getAllCaseAdvocates() {
        return caseAdvocateService.getAllCaseAdvocates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseAdvocate> getCaseAdvocateById(
            @PathVariable Integer id) {
        return caseAdvocateService.getCaseAdvocateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CaseAdvocate> createCaseAdvocate(
            @RequestBody CaseAdvocate caseAdvocate) {
        CaseAdvocate saved = caseAdvocateService.saveCaseAdvocate(caseAdvocate);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseAdvocate> updateCaseAdvocate(
            @PathVariable Integer id,
            @RequestBody CaseAdvocate caseAdvocate) {

        if (caseAdvocateService.getCaseAdvocateById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        caseAdvocate.setCaseAdvocateId(id);
        return ResponseEntity.ok(
                caseAdvocateService.saveCaseAdvocate(caseAdvocate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCaseAdvocate(@PathVariable Integer id) {
        if (caseAdvocateService.getCaseAdvocateById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        caseAdvocateService.deleteCaseAdvocate(id);
        return ResponseEntity.noContent().build();
    }
}
