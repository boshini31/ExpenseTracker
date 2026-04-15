package com.expensetracker.service;

import com.expensetracker.dto.CategoryDTO;
import com.expensetracker.dto.SummaryDTO;
import com.expensetracker.dto.TransactionDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Category;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public Page<TransactionDTO.Response> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAllByOrderByTransactionDateDesc(pageable)
                .map(this::toResponse);
    }

    public TransactionDTO.Response getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
    }

    public Page<TransactionDTO.Response> getByType(TransactionType type, Pageable pageable) {
        return transactionRepository.findByTypeOrderByTransactionDateDesc(type, pageable)
                .map(this::toResponse);
    }

    public List<TransactionDTO.Response> getByDateRange(LocalDate start, LocalDate end) {
        return transactionRepository
                .findByTransactionDateBetweenOrderByTransactionDateDesc(start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TransactionDTO.Response createTransaction(TransactionDTO.Request request) {
        Transaction transaction = buildFromRequest(new Transaction(), request);
        return toResponse(transactionRepository.save(transaction));
    }

    public TransactionDTO.Response updateTransaction(Long id, TransactionDTO.Request request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        buildFromRequest(transaction, request);
        return toResponse(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction", id);
        }
        transactionRepository.deleteById(id);
    }

    public SummaryDTO getSummary(LocalDate start, LocalDate end) {
        BigDecimal totalIncome = transactionRepository
                .sumByTypeAndDateRange(TransactionType.INCOME, start, end);
        BigDecimal totalExpense = transactionRepository
                .sumByTypeAndDateRange(TransactionType.EXPENSE, start, end);

        // Category breakdown
        List<Object[]> rawCategories = transactionRepository.expensesByCategory(start, end);
        List<SummaryDTO.CategorySummary> categorySummaries = new ArrayList<>();
        for (Object[] row : rawCategories) {
            String name = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            double pct = totalExpense.compareTo(BigDecimal.ZERO) == 0 ? 0
                    : amount.divide(totalExpense, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
            categorySummaries.add(new SummaryDTO.CategorySummary(name, amount, pct));
        }

        // Monthly totals
        List<Object[]> rawMonthly = transactionRepository.monthlyTotals(start, end);
        Map<String, SummaryDTO.MonthlyTotals> monthMap = new LinkedHashMap<>();
        for (Object[] row : rawMonthly) {
            String month = (String) row[0];
            String type = row[1].toString();
            BigDecimal amount = (BigDecimal) row[2];
            monthMap.computeIfAbsent(month,
                    m -> SummaryDTO.MonthlyTotals.builder().month(m)
                            .income(BigDecimal.ZERO).expense(BigDecimal.ZERO).build());
            if ("INCOME".equals(type)) monthMap.get(month).setIncome(amount);
            else monthMap.get(month).setExpense(amount);
        }

        return SummaryDTO.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(totalIncome.subtract(totalExpense))
                .expensesByCategory(categorySummaries)
                .monthlyTotals(new ArrayList<>(monthMap.values()))
                .build();
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private Transaction buildFromRequest(Transaction t, TransactionDTO.Request req) {
        t.setDescription(req.getDescription());
        t.setAmount(req.getAmount());
        t.setTransactionDate(req.getTransactionDate());
        t.setType(req.getType());
        t.setNotes(req.getNotes());
        if (req.getCategoryId() != null) {
            Category cat = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));
            t.setCategory(cat);
        } else {
            t.setCategory(null);
        }
        return t;
    }

    private TransactionDTO.Response toResponse(Transaction t) {
        CategoryDTO.Response catResp = null;
        if (t.getCategory() != null) {
            Category c = t.getCategory();
            catResp = CategoryDTO.Response.builder()
                    .id(c.getId()).name(c.getName())
                    .color(c.getColor()).type(c.getType()).build();
        }
        return TransactionDTO.Response.builder()
                .id(t.getId())
                .description(t.getDescription())
                .amount(t.getAmount())
                .transactionDate(t.getTransactionDate())
                .type(t.getType())
                .category(catResp)
                .notes(t.getNotes())
                .build();
    }
}
