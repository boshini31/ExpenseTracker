package com.expensetracker.service;

import com.expensetracker.dto.TransactionDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Category;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private CategoryRepository categoryRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction sampleTransaction;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L).name("Food").color("#FF6384")
                .type(TransactionType.EXPENSE).build();

        sampleTransaction = Transaction.builder()
                .id(1L)
                .description("Lunch")
                .amount(new BigDecimal("250.00"))
                .transactionDate(LocalDate.now())
                .type(TransactionType.EXPENSE)
                .category(sampleCategory)
                .build();
    }

    @Test
    @DisplayName("getAllTransactions returns paged response DTOs")
    void getAllTransactions_returnsPage() {
        Page<Transaction> page = new PageImpl<>(List.of(sampleTransaction));
        when(transactionRepository.findAllByOrderByTransactionDateDesc(any()))
                .thenReturn(page);

        Page<TransactionDTO.Response> result =
                transactionService.getAllTransactions(PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getDescription()).isEqualTo("Lunch");
    }

    @Test
    @DisplayName("getTransactionById throws ResourceNotFoundException when not found")
    void getById_notFound_throws() {
        when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getTransactionById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createTransaction saves correctly and returns DTO")
    void createTransaction_success() {
        TransactionDTO.Request request = TransactionDTO.Request.builder()
                .description("Dinner")
                .amount(new BigDecimal("450.00"))
                .transactionDate(LocalDate.now())
                .type(TransactionType.EXPENSE)
                .categoryId(1L)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(2L);
            return t;
        });

        TransactionDTO.Response response = transactionService.createTransaction(request);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getDescription()).isEqualTo("Dinner");
        assertThat(response.getAmount()).isEqualByComparingTo("450.00");
        assertThat(response.getCategory().getName()).isEqualTo("Food");
    }

    @Test
    @DisplayName("createTransaction throws when category not found")
    void createTransaction_categoryNotFound_throws() {
        TransactionDTO.Request request = TransactionDTO.Request.builder()
                .description("Test").amount(BigDecimal.TEN)
                .transactionDate(LocalDate.now())
                .type(TransactionType.EXPENSE).categoryId(99L).build();

        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.createTransaction(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("deleteTransaction calls repo deleteById when found")
    void deleteTransaction_success() {
        when(transactionRepository.existsById(1L)).thenReturn(true);

        transactionService.deleteTransaction(1L);

        verify(transactionRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteTransaction throws ResourceNotFoundException when not found")
    void deleteTransaction_notFound_throws() {
        when(transactionRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> transactionService.deleteTransaction(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
