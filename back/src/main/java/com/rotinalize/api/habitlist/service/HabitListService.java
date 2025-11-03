package com.rotinalize.api.habitlist.service;

import com.rotinalize.api.habitlist.dto.HabitListRequestDTO;
import com.rotinalize.api.habitlist.model.HabitList;
import com.rotinalize.api.habitlist.repository.HabitListRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.rotinalize.api.user.model.User;
import com.rotinalize.api.user.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
public class HabitListService {

    private final HabitListRepository repository;
    private final UserRepository userRepository;

    public HabitListService(HabitListRepository listRepository, UserRepository userRepository) {
        this.repository = listRepository;
        this.userRepository = userRepository;
    }

    // LISTAR LISTAS: Trás todas as listas do banco
    public List<HabitList> listAllByOwner(UUID ownerId) {
        // Agora chama o novo método do repositório
        return repository.findAllByOwnerIdWithHabits(ownerId);
    }

    // BUSCAR LISTA POR ID
    public HabitList get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lista de hábitos não encontrada."));
    }

    // DELETA LISTA
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Lista de hábitos não encontrada.");
        }
        repository.deleteById(id);
    }

    // CRIAR UMA NOVA LISTA
    @Transactional
    public HabitList create(HabitListRequestDTO dto, UUID ownerId) { // << 1. RECEBE O ownerId
        // 2. Busca o dono pelo ID recebido
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário (dono da lista) não encontrado."));

        // Verifica se esse usuário já tem uma lista com esse nome
        repository.findByOwnerAndName(owner, dto.name().trim()).ifPresent(list -> {
            throw new IllegalArgumentException("Você já possui uma lista com este nome.");
        });

        // 3. Cria a nova lista e associa o dono
        HabitList newList = new HabitList();
        newList.setName(dto.name().trim());
        newList.setOwner(owner); // <- USA O MÉTODO CORRETO: setOwner(User)

        return repository.save(newList);
    }
}