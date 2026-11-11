package com.lawfirm.backend.service;

import com.lawfirm.backend.entity.Case;
import com.lawfirm.backend.repository.CaseRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CaseService {

    private final CaseRepository caseRepository;

    public CaseService(CaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    public List<Case> getAllCases() {
        return caseRepository.findAll();
    }

    public Optional<Case> getCaseById(Integer id) {
        return caseRepository.findById(id);
    }

    public Case saveCase(Case legalCase) {
        return caseRepository.save(legalCase);
    }

    public void deleteCase(Integer id) {
        caseRepository.deleteById(id);
    }
}
