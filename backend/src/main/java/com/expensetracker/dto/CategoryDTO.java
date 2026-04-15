package com.expensetracker.dto;

import com.expensetracker.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

// ─── Category DTOs ────────────────────────────────────────────────────────────

public class CategoryDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Name is required")
        private String name;
        private String description;
        private String color;
        @NotNull(message = "Type is required")
        private TransactionType type;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String color;
        private TransactionType type;
    }
}
