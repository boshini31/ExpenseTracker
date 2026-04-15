package com.expensetracker.repository;

import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByTypeOrderByTransactionDateDesc(TransactionType type, Pageable pageable);

    Page<Transaction> findByCategoryIdOrderByTransactionDateDesc(Long categoryId, Pageable pageable);

    List<Transaction> findByTransactionDateBetweenOrderByTransactionDateDesc(
            LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type " +
           "AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumByTypeAndDateRange(
            @Param("type") TransactionType type,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT t.category.name, SUM(t.amount) FROM Transaction t " +
           "WHERE t.type = 'EXPENSE' AND t.transactionDate BETWEEN :start AND :end " +
           "GROUP BY t.category.name ORDER BY SUM(t.amount) DESC")
    List<Object[]> expensesByCategory(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT FUNCTION('TO_CHAR', t.transactionDate, 'YYYY-MM'), t.type, SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.transactionDate BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('TO_CHAR', t.transactionDate, 'YYYY-MM'), t.type " +
           "ORDER BY 1")
    List<Object[]> monthlyTotals(@Param("start") LocalDate start, @Param("end") LocalDate end);

    Page<Transaction> findAllByOrderByTransactionDateDesc(Pageable pageable);
}
