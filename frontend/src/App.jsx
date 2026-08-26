import { useEffect, useState } from "react";
import "./App.css";

const currencies = ["USD","NPR","INR","EUR","JPY","GBP"];

function App() {
  const [expenses, setExpenses] = useState ([]);

  const [homeCurrency, setHomeCurrency] = useState("NPR");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");

  const [error, setError] = useState("");

  const [convertedExpenses, setConvertedExpenses] = useState({});
  const [conversionLoading, setConversionLoading] = useState(false);

  // load expenses from backend
  useEffect(() => {
    fetch("http://localhost:5000/expenses")
    .then((response) => response.json())
    .then((data) => {
      setExpenses(data);
    })
    .catch(() => {
      setError("Could not load expenses");
    });
  }, []);

  // convert expenses whenever expenses or home currency changes
  useEffect(() => {
    async function convertExpenses() {
      if (expenses.length === 0) return;

      setConversionLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          expenses.map(async (expense) => {
            const response = await fetch(
              `http://localhost:5000/convert?from=${expense.currency}&to=${homeCurrency}&amount=${expense.amount}`
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error);
            }

            return {
              id: expense.id,
              convertedAmount: data.convertedAmount,
            };
          })
        );

        const converted = {};

        results.forEach((item) => {
          converted[item.id] = item.convertedAmount;
        });

        setConvertedExpenses(converted);

      } catch (error) {
        setError("Currency conversion failed");

      } finally {
        setConversionLoading(false);
      }
    }

    convertExpenses();
  }, [expenses, homeCurrency]);

  // add expenses
  async function add(e) {
    e.preventDefault();
    if(!title || !amount){
      setError("Please enter a title and amount");
      return;
    }

    try{
      const response = await fetch(
        "http://localhost:5000/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            amount: Number(amount),
            currency,
          }),
        }
      );

      const data = await response.json();

      if(!response.ok){
        setError(data.error);
        return;
      }

      setExpenses([data, ...expenses]);
      setTitle("");
      setAmount("");
      setError("");
    } catch(error){
      setError("Could not add expense");
    }    
  }

  // delete expenses
  async function remove(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/expenses/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setError("Could not delete expense");
        return;
      }

      setExpenses(
        expenses.filter((e) => e.id !== id)
      );

      setConvertedExpenses((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });
    } catch (error) {
        setError("Could not delete expense");
      }
  }

  // calculate total
  const total = expenses.reduce(
    (sum, e) => sum + (convertedExpenses[e.id] || 0),
    0
  );

  return (
    <div className="app">
      <h1>Currency & Expenses Tracker</h1>

      <div className="home-currency">
        <span>Home Currency</span>

        <select
          value={homeCurrency} onChange={(e) => setHomeCurrency(e.target.value)}>
            {currencies.map((c) => (
              <option key = {c} value={c}>
                {c}
              </option>
            ))}
        </select>
      </div>

      {error && <div className="error"> {error} </div>}

      <form className="form" onSubmit={add}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <select
          value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>

        <button type="submit"> Add </button>
      </form>

      <div className="expense-list">
        {expenses.map((e) => (
          <div className="expense-row" key={e.id}>
            <div>
              <div className="expense-title">{e.title}</div>
              <div className="expense-date">{e.date}</div>
            </div>

            <div className="expense-amount">
              <span className="original">{e.amount} {e.currency}</span>
              <span className="converted">
                {conversionLoading ? "Converting..." : convertedExpenses[e.id] !== undefined ? `${convertedExpenses[e.id].toFixed(2)} ${homeCurrency}` : "-"}
              </span>
              
              <button onClick={() => remove(e.id)}> Delete </button>
            </div>
          </div>
        ))}
      </div>

      <div className="total">
        <span> Total in {homeCurrency} </span>
        <span className="total-amount">
          {total.toFixed(2)} {homeCurrency}
        </span>
      </div>
    </div>
  );
}

export default App;