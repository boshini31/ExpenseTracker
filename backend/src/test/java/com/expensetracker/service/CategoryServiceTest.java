package com.expensetracker.service;

import com.expensetracker.dto.CategoryDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Category;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L).name("Food").color("#FF6384")
                .type(TransactionType.EXPENSE).build();
    }

    @Test
    @DisplayName("getAllCategories returns all categories mapped to response DTOs")
    void getAllCategories_returnsMappedList() {
        when(categoryRepository.findAll()).thenReturn(List.of(sampleCategory));

        List<CategoryDTO.Response> result = categoryService.getAllCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Food");
        assertThat(result.get(0).getType()).isEqualTo(TransactionType.EXPENSE);
    }

    @Test
    @DisplayName("getCategoryById throws ResourceNotFoundException when not found")
    void getCategoryById_notFound_throws() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.getCategoryById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("createCategory saves and returns new category")
    void createCategory_success() {
        CategoryDTO.Request request = new CategoryDTO.Request(
                "Transport", "Travel expenses", "#36A2EB", TransactionType.EXPENSE);

        when(categoryRepository.existsByName("Transport")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(2L);
            return c;
        });

        CategoryDTO.Response response = categoryService.createCategory(request);

        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getName()).isEqualTo("Transport");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("createCategory throws when duplicate name")
    void createCategory_duplicateName_throws() {
        CategoryDTO.Request request = new CategoryDTO.Request(
                "Food", null, null, TransactionType.EXPENSE);
        when(categoryRepository.existsByName("Food")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("deleteCategory calls repository delete when category exists")
    void deleteCategory_success() {
        when(categoryRepository.existsById(1L)).thenReturn(true);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteCategory throws when category not found")
    void deleteCategory_notFound_throws() {
        when(categoryRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> categoryService.deleteCategory(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
