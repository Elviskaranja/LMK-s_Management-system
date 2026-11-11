
package com.lawfirm.backend.service;

import com.lawfirm.backend.entity.Advocate;
import com.lawfirm.backend.repository.AdvocateRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdvocateService {

    private final AdvocateRepository advocateRepository;

    public AdvocateService(AdvocateRepository advocateRepository) {
        this.advocateRepository = advocateRepository;
    }

    public List<Advocate> getAllAdvocates() {
        return advocateRepository.findAll();
    }

    public Optional<Advocate> getAdvocateById(Integer id) {
        return advocateRepository.findById(id);
    }

    public Advocate saveAdvocate(Advocate advocate) {
        return advocateRepository.save(advocate);
    }

    public void deleteAdvocate(Integer id) {
        advocateRepository.deleteById(id);
    }
}
