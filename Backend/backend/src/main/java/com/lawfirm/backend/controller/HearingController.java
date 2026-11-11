
package com.lawfirm.backend.controller;

import com.lawfirm.backend.entity.Hearing;
import com.lawfirm.backend.service.HearingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hearings")
@CrossOrigin(origins = "http://localhost:5173")
public class HearingController {

    private final HearingService hearingService;

    public HearingController(HearingService hearingService) {
        this.hearingService = hearingService;
    }

    @GetMapping
    public List<Hearing> getAllHearings() {
        return hearingService.getAllHearings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hearing> getHearingById(@PathVariable Integer id) {
        return hearingService.getHearingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Hearing> createHearing(@RequestBody Hearing hearing) {
        Hearing saved = hearingService.saveHearing(hearing);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hearing> updateHearing(
            @PathVariable Integer id, @RequestBody Hearing hearing) {

        if (hearingService.getHearingById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        hearing.setHearingId(id);
        return ResponseEntity.ok(hearingService.saveHearing(hearing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHearing(@PathVariable Integer id) {
        if (hearingService.getHearingById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        hearingService.deleteHearing(id);
        return ResponseEntity.noContent().build();
    }
}
