package com.rotinalize.api.user.repository;

import com.rotinalize.api.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Método para buscar um usuário pelo seu email.
    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);

}