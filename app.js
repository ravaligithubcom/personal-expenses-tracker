const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");

// Middleware to parse JSON bodies
app.use(express.json());

// Example root route to respond to requests at "/"
app.get("/", (req, res) => {
  res.send("Welcome to the Personal Expense Tracker API!");
});

// POST /transactions - Add a new transaction
app.post("/transactions", (req, res) => {
  const { type, category, amount, date, description } = req.body;
  const query = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [type, category, amount, date, description], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// GET /transactions - Retrieve all transactions
app.get("/transactions", (req, res) => {
  const query = `SELECT * FROM transactions`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /summary - Calculate total income, total expense, and balance
app.get("/summary", (req, res) => {
  const totalIncomeQuery = `SELECT SUM(amount) AS total_income FROM transactions WHERE type = 'income'`;
  const totalExpenseQuery = `SELECT SUM(amount) AS total_expense FROM transactions WHERE type = 'expense'`;

  db.get(totalIncomeQuery, (err, incomeRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(totalExpenseQuery, (err, expenseRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalIncome = incomeRow.total_income || 0;
      const totalExpense = expenseRow.total_expense || 0;
      const balance = totalIncome - totalExpense;

      res.json({
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance,
      });
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
