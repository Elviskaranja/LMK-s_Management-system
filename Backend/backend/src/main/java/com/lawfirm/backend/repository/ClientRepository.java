package com.lawfirm.backend.repository;

import com.lawfirm.backend.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClientRepository extends JpaRepository<Client, Integer> {

    // Counts all clients.
    @Query("SELECT COUNT(c) FROM Client c")
    long countAllClients();
}
