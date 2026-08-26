const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const currencies = ["USD", "NPR", "INR", "EUR", "GBP", "JPY"];

let expenses = [
  {
    id: 1,
    title: "Netflix",
    amount: 30,
    currency: "USD",
    date: "Aug 24",
  },
  {
    id: 2,
    title: "Sushi",
    amount: 600,
    currency: "JPY",
    date: "Aug 23",
  },
];


// GET all expenses
app.get("/expenses", (req, res) => {
  res.json(expenses);
});


// POST a new expense
app.post("/expenses", (req, res) => {
  const { title, amount, currency } = req.body;

  // Validate title
  if (!title || !title.trim()) {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  // Validate amount
  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    isNaN(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return res.status(400).json({
      error: "Valid amount is required",
    });
  }

  // Validate currency
  if (!currencies.includes(currency)) {
    return res.status(400).json({
      error: "Invalid currency",
    });
  }

  const newExpense = {
    id: Date.now(),
    title: title.trim(),
    amount: Number(amount),
    currency: currency,
    date: new Date().toLocaleDateString(),
  };

  expenses.push(newExpense);

  res.status(201).json(newExpense);
});


// DELETE an expense
app.delete("/expenses/:id", (req, res) => {
  const id = Number(req.params.id);

  const expenseExists = expenses.some(
    (expense) => expense.id === id
  );

  if (!expenseExists) {
    return res.status(404).json({
      error: "Expense not found",
    });
  }

  expenses = expenses.filter(
    (expense) => expense.id !== id
  );

  res.json({
    message: "Expense deleted successfully",
  });
});


// Currency conversion
app.get("/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  // Validate currencies
  if (!currencies.includes(from) || !currencies.includes(to)) {
    return res.status(400).json({
      error: "Invalid currency",
    });
  }

  // Validate amount
  const numericAmount = Number(amount);

  if (
    amount === undefined ||
    amount === "" ||
    isNaN(numericAmount) ||
    numericAmount <= 0
  ) {
    return res.status(400).json({
      error: "Valid amount is required",
    });
  }

  // Same currency
  if (from === to) {
    return res.json({
      from,
      to,
      amount: numericAmount,
      convertedAmount: numericAmount,
    });
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rate/${from}/${to}`
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "Currency service is unavailable",
      });
    }

    const data = await response.json();

    const convertedAmount = numericAmount * data.rate;

    res.json({
      from,
      to,
      amount: numericAmount,
      rate: data.rate,
      convertedAmount,
    });

  } catch (error) {
    res.status(502).json({
      error: "Could not connect to currency service",
    });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});