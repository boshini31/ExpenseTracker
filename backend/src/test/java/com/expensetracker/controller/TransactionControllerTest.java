package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.TransactionDTO;
import com.expensetracker.model.TransactionType;
import com.expensetracker.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean TransactionService transactionService;

    private TransactionDTO.Response sampleResponse() {
        return TransactionDTO.Response.builder()
                .id(1L).description("Lunch")
                .amount(new BigDecimal("250.00"))
                .transactionDate(LocalDate.of(2024, 6, 15))
                .type(TransactionType.EXPENSE)
                .build();
    }

    @Test
    @DisplayName("GET /api/transactions returns 200 with paged results")
    void getAll_returns200() throws Exception {
        Page<TransactionDTO.Response> page = new PageImpl<>(List.of(sampleResponse()));
        when(transactionService.getAllTransactions(any())).thenReturn(page);

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].description").value("Lunch"));
    }

    @Test
    @DisplayName("GET /api/transactions/{id} returns 200 with transaction")
    void getById_returns200() throws Exception {
        when(transactionService.getTransactionById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.description").value("Lunch"));
    }

    @Test
    @DisplayName("POST /api/transactions with valid body returns 201")
    void create_validBody_returns201() throws Exception {
        TransactionDTO.Request req = TransactionDTO.Request.builder()
                .description("Dinner")
                .amount(new BigDecimal("300.00"))
                .transactionDate(LocalDate.now())
                .type(TransactionType.EXPENSE)
                .build();

        when(transactionService.createTransaction(any())).thenReturn(sampleResponse());

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/transactions with missing description returns 400")
    void create_missingDescription_returns400() throws Exception {
        TransactionDTO.Request req = TransactionDTO.Request.builder()
                .amount(new BigDecimal("100.00"))
                .transactionDate(LocalDate.now())
                .type(TransactionType.EXPENSE)
                .build();

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.description").exists());
    }

    @Test
    @DisplayName("DELETE /api/transactions/{id} returns 200 on success")
    void delete_returns200() throws Exception {
        doNothing().when(transactionService).deleteTransaction(1L);

        mockMvc.perform(delete("/api/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
