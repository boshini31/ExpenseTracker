package com.expensetracker.dto;

import com.expensetracker.model.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be > 0")
        private BigDecimal amount;

        @NotNull(message = "Date is required")
        private LocalDate transactionDate;

        @NotNull(message = "Type is required")
        private TransactionType type;

        private Long categoryId;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String description;
        private BigDecimal amount;
        private LocalDate transactionDate;
        private TransactionType type;
        private CategoryDTO.Response category;
        private String notes;
    }
}
