package com.expensetracker.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SummaryDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<CategorySummary> expensesByCategory;
    private List<MonthlyTotals> monthlyTotals;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySummary {
        private String categoryName;
        private BigDecimal amount;
        private double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTotals {
        private String month; // "2024-01"
        private BigDecimal income;
        private BigDecimal expense;
    }
}
