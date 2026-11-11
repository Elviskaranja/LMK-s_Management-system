
package com.lawfirm.backend.service;

import com.lawfirm.backend.entity.CaseAdvocate;
import com.lawfirm.backend.repository.CaseAdvocateRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CaseAdvocateService {

    private final CaseAdvocateRepository caseAdvocateRepository;

    public CaseAdvocateService(CaseAdvocateRepository caseAdvocateRepository) {
        this.caseAdvocateRepository = caseAdvocateRepository;
    }

    public List<CaseAdvocate> getAllCaseAdvocates() {
        return caseAdvocateRepository.findAll();
    }

    public Optional<CaseAdvocate> getCaseAdvocateById(Integer id) {
        return caseAdvocateRepository.findById(id);
    }

    public CaseAdvocate saveCaseAdvocate(CaseAdvocate caseAdvocate) {
        return caseAdvocateRepository.save(caseAdvocate);
    }

    public void deleteCaseAdvocate(Integer id) {
        caseAdvocateRepository.deleteById(id);
    }
}
