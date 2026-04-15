package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.SummaryDTO;
import com.expensetracker.dto.TransactionDTO;
import com.expensetracker.model.TransactionType;
import com.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionDTO.Response>>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) TransactionType type) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionDTO.Response> data = (type != null)
                ? transactionService.getByType(type, pageable)
                : transactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getTransactionById(id)));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<TransactionDTO.Response>>> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getByDateRange(start, end)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryDTO>> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now().withDayOfYear(1);
        if (end   == null) end   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(transactionService.getSummary(start, end)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDTO.Response>> create(
            @Valid @RequestBody TransactionDTO.Request request) {
        TransactionDTO.Response created = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDTO.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDTO.Request request) {
        return ResponseEntity.ok(
                ApiResponse.success("Transaction updated",
                        transactionService.updateTransaction(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted", null));
    }
}
