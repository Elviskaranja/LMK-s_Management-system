package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Advocate;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AdvocateRepository extends JpaRepository<Advocate, Integer> {

}
