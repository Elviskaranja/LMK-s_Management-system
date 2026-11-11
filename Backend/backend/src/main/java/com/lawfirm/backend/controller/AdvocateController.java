
package com.lawfirm.backend.controller;

import com.lawfirm.backend.entity.Advocate;
import com.lawfirm.backend.service.AdvocateService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/advocates")
@CrossOrigin(origins = "http://localhost:5173")
public class AdvocateController {

    private final AdvocateService advocateService;

    public AdvocateController(AdvocateService advocateService) {
        this.advocateService = advocateService;
    }

    @GetMapping
    public List<Advocate> getAllAdvocates() {
        return advocateService.getAllAdvocates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Advocate> getAdvocateById(@PathVariable Integer id) {
        return advocateService.getAdvocateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Advocate> createAdvocate(@RequestBody Advocate advocate) {
        Advocate saved = advocateService.saveAdvocate(advocate);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Advocate> updateAdvocate(
            @PathVariable Integer id, @RequestBody Advocate advocate) {

        if (advocateService.getAdvocateById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        advocate.setAdvocateId(id);
        return ResponseEntity.ok(advocateService.saveAdvocate(advocate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdvocate(@PathVariable Integer id) {
        if (advocateService.getAdvocateById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        advocateService.deleteAdvocate(id);
        return ResponseEntity.noContent().build();
    }
}
