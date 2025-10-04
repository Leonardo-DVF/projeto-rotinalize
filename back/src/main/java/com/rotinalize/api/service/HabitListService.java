package com.rotinalize.api.service;

import com.rotinalize.api.dto.HabitListRequestDTO;
import com.rotinalize.api.entities.HabitList;
import com.rotinalize.api.repository.HabitListRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HabitListService {

    private final HabitListRepository repository;

    public HabitListService(HabitListRepository repository) {
        this.repository = repository;
    }

    // LISTAR LISTAS: Trás todas as listas do banco
    public List<HabitList> listAll() {
        // Usamos a nova query que força o carregamento dos hábitos (JOIN FETCH)
        return repository.findAllWithHabits();
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
    public HabitList create(HabitListRequestDTO dto) {
        // Simulação de ownerId (se você não tiver login implementado)
        UUID ownerId = null;

        // 1. VERIFICAÇÃO DE DUPLICIDADE: Evita que listas com o mesmo nome sejam criadas
        if (ownerId == null && repository.findByName(dto.name().trim()).isPresent()) {
            throw new IllegalArgumentException("Já existe uma lista com o nome: " + dto.name());
        }
        // Se tivesse ownerId, seria:
        // if (ownerId != null && repository.findByOwnerIdAndName(ownerId, dto.name().trim()).isPresent()) {
        //      throw new IllegalArgumentException("Você já possui uma lista com o nome: " + dto.name());
        // }


        // 2. Cria e salva a entidade
        HabitList list = new HabitList();
        list.setName(dto.name().trim());
        list.setOwnerId(ownerId);

        return repository.save(list);
    }
}