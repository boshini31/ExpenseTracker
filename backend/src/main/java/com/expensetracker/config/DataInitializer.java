package com.expensetracker.config;

import com.expensetracker.model.Category;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            log.info("Seeding default categories...");
            List<Category> defaults = List.of(
                // Expense categories
                Category.builder().name("Food & Dining").color("#FF6384").type(TransactionType.EXPENSE).build(),
                Category.builder().name("Transport").color("#36A2EB").type(TransactionType.EXPENSE).build(),
                Category.builder().name("Housing").color("#FFCE56").type(TransactionType.EXPENSE).build(),
                Category.builder().name("Utilities").color("#4BC0C0").type(TransactionType.EXPENSE).build(),
                Category.builder().name("Healthcare").color("#9966FF").type(TransactionType.EXPENSE).build(),
                Category.builder().name("Entertainment").color("#FF9F40").type(TransactionType.EXPENSE).build(),
                Category.builder().name("Shopping").color("#FF6384").type(TransactionType.EXPENSE).build(),
                Category.builder().name("Education").color("#36A2EB").type(TransactionType.EXPENSE).build(),
                // Income categories
                Category.builder().name("Salary").color("#4CAF50").type(TransactionType.INCOME).build(),
                Category.builder().name("Freelance").color("#8BC34A").type(TransactionType.INCOME).build(),
                Category.builder().name("Investment").color("#00BCD4").type(TransactionType.INCOME).build(),
                Category.builder().name("Other Income").color("#9C27B0").type(TransactionType.INCOME).build()
            );
            categoryRepository.saveAll(defaults);
            log.info("Seeded {} categories.", defaults.size());
        }
    }
}
