package com.expensetracker.repository;

import com.expensetracker.model.Category;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class TransactionRepositoryTest {

    @Autowired TransactionRepository transactionRepository;
    @Autowired CategoryRepository categoryRepository;

    private Category expenseCategory;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
        categoryRepository.deleteAll();

        expenseCategory = categoryRepository.save(Category.builder()
                .name("Food").color("#FF6384").type(TransactionType.EXPENSE).build());

        transactionRepository.saveAll(List.of(
            Transaction.builder()
                .description("Lunch").amount(new BigDecimal("200.00"))
                .transactionDate(LocalDate.of(2024, 6, 10))
                .type(TransactionType.EXPENSE).category(expenseCategory).build(),
            Transaction.builder()
                .description("Dinner").amount(new BigDecimal("350.00"))
                .transactionDate(LocalDate.of(2024, 6, 15))
                .type(TransactionType.EXPENSE).category(expenseCategory).build(),
            Transaction.builder()
                .description("Salary").amount(new BigDecimal("50000.00"))
                .transactionDate(LocalDate.of(2024, 6, 1))
                .type(TransactionType.INCOME).build()
        ));
    }

    @Test
    @DisplayName("sumByType returns correct total for INCOME")
    void sumByType_income() {
        BigDecimal income = transactionRepository.sumByType(TransactionType.INCOME);
        assertThat(income).isEqualByComparingTo("50000.00");
    }

    @Test
    @DisplayName("sumByType returns correct total for EXPENSE")
    void sumByType_expense() {
        BigDecimal expense = transactionRepository.sumByType(TransactionType.EXPENSE);
        assertThat(expense).isEqualByComparingTo("550.00");
    }

    @Test
    @DisplayName("sumByTypeAndDateRange returns only amounts within date range")
    void sumByTypeAndDateRange() {
        BigDecimal amount = transactionRepository.sumByTypeAndDateRange(
                TransactionType.EXPENSE,
                LocalDate.of(2024, 6, 12),
                LocalDate.of(2024, 6, 30));
        assertThat(amount).isEqualByComparingTo("350.00");
    }

    @Test
    @DisplayName("findByTransactionDateBetween returns only transactions within range")
    void findByDateRange() {
        List<Transaction> result = transactionRepository
                .findByTransactionDateBetweenOrderByTransactionDateDesc(
                        LocalDate.of(2024, 6, 1),
                        LocalDate.of(2024, 6, 10));
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("expensesByCategory groups and sums correctly")
    void expensesByCategory() {
        List<Object[]> result = transactionRepository.expensesByCategory(
                LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31));
        assertThat(result).hasSize(1);
        assertThat(result.get(0)[0]).isEqualTo("Food");
        assertThat((BigDecimal) result.get(0)[1]).isEqualByComparingTo("550.00");
    }
}
