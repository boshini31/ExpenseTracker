# Personal Expense Tracker

Full-stack expense tracking application built with Spring Boot, React.js, and PostgreSQL.

---

## Project Structure

```
expense-tracker/
├── backend/                          # Spring Boot API
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/expensetracker/
│       │   ├── ExpenseTrackerApplication.java
│       │   ├── config/           # CORS, DataInitializer
│       │   ├── controller/       # REST controllers
│       │   ├── dto/              # Request / Response DTOs
│       │   ├── exception/        # Custom exceptions + GlobalExceptionHandler
│       │   ├── model/            # JPA entities
│       │   ├── repository/       # Spring Data JPA repos
│       │   └── service/          # Business logic
│       └── test/                 # Unit + integration tests
└── frontend/                         # React.js UI
    ├── package.json
    └── src/
        ├── App.js / App.css
        ├── components/           # Dashboard, TransactionList, TransactionForm, CategoryList
        ├── services/api.js       # Axios API layer
        └── tests/                # React component tests
```

---

## Prerequisites

| Tool       | Version  |
|------------|----------|
| Java       | 17+      |
| Maven      | 3.8+     |
| Node.js    | 18+      |
| npm        | 9+       |
| PostgreSQL | 14+      |

---

## Database Setup

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE expense_tracker;
CREATE USER expense_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;
```

Then update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/expense_tracker
spring.datasource.username=expense_user
spring.datasource.password=your_password
```

---

## Running the Backend

```bash
cd backend

# Build
mvn clean install -DskipTests

# Run
mvn spring-boot:run
```

API starts at: **http://localhost:8080**

On first run, `DataInitializer` seeds 12 default categories automatically.

---

## Running the Frontend

```bash
cd frontend
npm install
npm start
```

App opens at: **http://localhost:3000**

The `"proxy": "http://localhost:8080"` in `package.json` routes `/api` calls to Spring Boot.

---

## REST API Reference

### Transactions
| Method | Endpoint                       | Description                          |
|--------|--------------------------------|--------------------------------------|
| GET    | `/api/transactions`            | List all (paginated). `?type=EXPENSE|INCOME` |
| GET    | `/api/transactions/{id}`       | Get by ID                            |
| GET    | `/api/transactions/range`      | Filter by date. `?start=&end=`       |
| GET    | `/api/transactions/summary`    | Dashboard summary. `?start=&end=`    |
| POST   | `/api/transactions`            | Create new transaction               |
| PUT    | `/api/transactions/{id}`       | Update transaction                   |
| DELETE | `/api/transactions/{id}`       | Delete transaction                   |

### Categories
| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/categories`      | List all. `?type=EXPENSE|INCOME`     |
| GET    | `/api/categories/{id}` | Get by ID                            |
| POST   | `/api/categories`      | Create category                      |
| PUT    | `/api/categories/{id}` | Update category                      |
| DELETE | `/api/categories/{id}` | Delete category                      |

---

## Sample API Request/Response

### POST /api/transactions
**Request body:**
```json
{
  "description": "Grocery shopping",
  "amount": 1250.00,
  "transactionDate": "2024-06-15",
  "type": "EXPENSE",
  "categoryId": 1,
  "notes": "Weekly groceries"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": 12,
    "description": "Grocery shopping",
    "amount": 1250.00,
    "transactionDate": "2024-06-15",
    "type": "EXPENSE",
    "category": { "id": 1, "name": "Food & Dining", "color": "#FF6384", "type": "EXPENSE" },
    "notes": "Weekly groceries"
  },
  "timestamp": "2024-06-15T10:30:00"
}
```

---

## Running Backend Tests

```bash
cd backend

# Run all tests (uses H2 in-memory DB via application-test.properties)
mvn test

# Run specific test class
mvn test -Dtest=TransactionServiceTest
mvn test -Dtest=TransactionControllerTest
mvn test -Dtest=TransactionRepositoryTest

# Generate Surefire HTML report
mvn surefire-report:report
# Report: target/site/surefire-report.html

# Check test coverage with JaCoCo
mvn test jacoco:report
# Report: target/site/jacoco/index.html
```

### What the backend tests cover

| Test Class                  | Type          | What it tests                                          |
|-----------------------------|---------------|--------------------------------------------------------|
| `CategoryServiceTest`       | Unit (Mockito)| CRUD logic, duplicate detection, ResourceNotFoundException |
| `TransactionServiceTest`    | Unit (Mockito)| Create/update/delete, category FK resolution           |
| `TransactionControllerTest` | MockMvc       | HTTP status codes, JSON shape, validation errors       |
| `TransactionRepositoryTest` | @DataJpaTest  | Custom JPQL queries, sum aggregation, date range filter|

---

## Running Frontend Tests

```bash
cd frontend

# Interactive watch mode
npm test

# Single run (CI)
npm test -- --watchAll=false

# With coverage report
npm run test:coverage
# Report printed to console; HTML in coverage/lcov-report/index.html

# Run a specific test file
npm test -- --testPathPattern=TransactionForm
```

### What the frontend tests cover

| Test File              | What it tests                                                  |
|------------------------|----------------------------------------------------------------|
| `TransactionForm.test` | Form rendering, validation errors, create/update API calls, cancel handler |
| `api.test`             | Axios wrapper — param building, endpoint paths                 |

---

## Manual Testing with curl

```bash
# Create a category
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Food","color":"#FF6384","type":"EXPENSE"}'

# Create a transaction
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Lunch","amount":250.00,"transactionDate":"2024-06-15","type":"EXPENSE","categoryId":1}'

# List transactions (paginated)
curl "http://localhost:8080/api/transactions?page=0&size=10"

# Filter by type
curl "http://localhost:8080/api/transactions?type=EXPENSE"

# Date range
curl "http://localhost:8080/api/transactions/range?start=2024-01-01&end=2024-12-31"

# Dashboard summary
curl "http://localhost:8080/api/transactions/summary?start=2024-01-01&end=2024-12-31"

# Update
curl -X PUT http://localhost:8080/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated Lunch","amount":300.00,"transactionDate":"2024-06-15","type":"EXPENSE"}'

# Delete
curl -X DELETE http://localhost:8080/api/transactions/1
```

---

## Testing with Postman

1. Import requests manually or use the curl examples above.
2. Set base URL variable: `{{base_url}} = http://localhost:8080`
3. Suggested test sequence:
   - `GET /api/categories` — verify seeded categories exist
   - `POST /api/transactions` — create income + expense records
   - `GET /api/transactions/summary` — verify dashboard totals
   - `PUT /api/transactions/{id}` — test update flow
   - `DELETE /api/transactions/{id}` — verify deletion

---

## Features

- **Dashboard** — KPI cards (Income / Expense / Balance), doughnut chart by category, monthly bar chart, recent transactions table
- **Transactions** — Paginated list with type filter, inline edit/delete, form with validation
- **Categories** — CRUD management for expense and income categories with color picker
- **API** — Fully RESTful with consistent `ApiResponse<T>` wrapper, bean validation, and global exception handling

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Java 17, Spring Boot 3.2, Spring Data JPA, Hibernate |
| Database  | PostgreSQL 14, H2 (tests)               |
| Frontend  | React 18, Axios, Chart.js, react-chartjs-2 |
| Testing   | JUnit 5, Mockito, MockMvc, @DataJpaTest, React Testing Library |
| Build     | Maven, npm / react-scripts              |
