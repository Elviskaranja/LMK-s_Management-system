
package com.lawfirm.backend.service;

import com.lawfirm.backend.entity.Hearing;
import com.lawfirm.backend.repository.HearingRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HearingService {

    private final HearingRepository hearingRepository;

    public HearingService(HearingRepository hearingRepository) {
        this.hearingRepository = hearingRepository;
    }

    public List<Hearing> getAllHearings() {
        return hearingRepository.findAll();
    }

    public Optional<Hearing> getHearingById(Integer id) {
        return hearingRepository.findById(id);
    }

    public Hearing saveHearing(Hearing hearing) {
        return hearingRepository.save(hearing);
    }

    public void deleteHearing(Integer id) {
        hearingRepository.deleteById(id);
    }
}
