package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


public interface DocumentRepository extends JpaRepository<Document, Integer> {

}