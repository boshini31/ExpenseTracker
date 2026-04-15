package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.CategoryDTO;
import com.expensetracker.model.TransactionType;
import com.expensetracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO.Response>>> getAll(
            @RequestParam(required = false) TransactionType type) {
        List<CategoryDTO.Response> data = (type != null)
                ? categoryService.getCategoriesByType(type)
                : categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDTO.Response>> create(
            @Valid @RequestBody CategoryDTO.Request request) {
        CategoryDTO.Response created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO.Request request) {
        return ResponseEntity.ok(
                ApiResponse.success("Category updated successfully",
                        categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
