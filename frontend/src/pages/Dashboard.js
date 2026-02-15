import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { color } from "chart.js/helpers";

const COLORS = ["#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

function Dashboard() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [aiInsight, setAiInsight] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSource, setIncomeSource] = useState("");

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else {
      fetchExpenses();
      fetchSummary();
    }
  }, []);

  const fetchExpenses = async () => {
    const res = await API.get("/expenses");
    setExpenses(res.data);
  };

  const fetchSummary = async () => {
    const res = await API.get("/summary");
    setSummary(res.data);
  };

  // ADD INCOME
  const handleAddIncome = async (e) => {
    e.preventDefault();
    await API.post("/income", {
      amount: parseFloat(incomeAmount),
      source: incomeSource,
    });
    setIncomeAmount("");
    setIncomeSource("");
    fetchSummary();
  };

  // ADD EXPENSE
  const handleAddExpense = async (e) => {
    e.preventDefault();
    await API.post("/expenses", {
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
    });
    setExpenseAmount("");
    setExpenseCategory("");
    fetchExpenses();
    fetchSummary();
  };

  // STREAMING AI
  const fetchAIStream = async () => {
    setAiInsight("");
    setLoadingAI(true);

    const response = await fetch("http://127.0.0.1:8000/ai-stream", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value);
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index >= fullText.length) {
        clearInterval(interval);
        setLoadingAI(false);
        return;
      }
      setAiInsight(fullText.slice(0, index + 1));
      index++;
    }, 20);
  };

  const pieData = Object.values(
    expenses.reduce((acc, curr) => {
      acc[curr.category] = acc[curr.category] || {
        name: curr.category,
        value: 0,
      };
      acc[curr.category].value += curr.amount;
      return acc;
    }, {})
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background:
          "linear-gradient(135deg, #0f172a, #1e1b4b, #000000)",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "32px" }}>AI Finance Copilot 🚀</h1>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "10px",
          padding: "6px 12px",
          background: "#ef4444",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* 🔥 TOP SECTION — ADD INCOME & EXPENSE */}
      <div style={{ display: "flex", gap: "30px", marginTop: "40px" }}>

        {/* ADD INCOME */}
        <motion.form
          whileHover={{ scale: 1.03 }}
          onSubmit={handleAddIncome}
          style={{
            flex: 1,
            padding: "25px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 30px rgba(34,197,94,0.3)",
          }}
        >
          <h3>Add Income 💰</h3>

          <input
            type="number"
            placeholder="Amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Source"
            value={incomeSource}
            onChange={(e) => setIncomeSource(e.target.value)}
            required
            style={inputStyle}
          />

          <button style={greenButton}>Add Income</button>
        </motion.form>

        {/* ADD EXPENSE */}
        <motion.form
          whileHover={{ scale: 1.03 }}
          onSubmit={handleAddExpense}
          style={{
            flex: 1,
            padding: "25px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 30px rgba(239,68,68,0.3)",
          }}
        >
          <h3>Add Expense 💸</h3>

          <input
            type="number"
            placeholder="Amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Category"
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            required
            style={inputStyle}
          />

          <button style={redButton}>Add Expense</button>
        </motion.form>
      </div>

      {/* FINANCIAL OVERVIEW */}
      {summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={cardStyle}
        >
          <h2>Financial Overview</h2>

          <p>Income: ₹{Number(summary.total_income).toLocaleString("en-IN")}</p>
          <p>Expense: ₹{Number(summary.total_expense).toLocaleString("en-IN")}</p>
          <p>Savings: ₹{Number(summary.savings).toLocaleString("en-IN")}</p>

          <p>Financial Score: {summary.financial_score}/100</p>

          <div style={progressBarBackground}>
            <motion.div
              key={summary.financial_score}
              initial={{ width: 0 }}
              animate={{ width: `${summary.financial_score}%` }}
              transition={{ duration: 1 }}
              style={{
                height: "12px",
                borderRadius: "10px",
                background: "#8b5cf6",
              }}
            />
          </div>

          <button
            onClick={fetchAIStream}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "linear-gradient(90deg,#8b5cf6,#3b82f6)",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            {loadingAI ? "Generating..." : "Generate AI Insight"}
          </button>
        </motion.div>
      )}

      {/* CHARTS SECTION */}
      <div style={{ display: "flex", gap: "40px", marginTop: "40px" }}>
        <div style={{ flex: 1 }}>
          <h3>Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={100} >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            width: "280px",
            maxHeight: "300px",
            overflowY: "auto",
            background: "rgba(255,255,255,0.06)",
            padding: "20px",
            borderRadius: "20px",
          }}
        >
          <h3>Recent Expenses</h3>
          {expenses.slice(-5).reverse().map((e) => (
            <div key={e.id} style={{ marginTop: "10px" }}>
              {e.category} — ₹{e.amount}
            </div>
          ))}
        </div>
      </div>

      {/* AI OUTPUT */}
      {aiInsight && (
        <div style={{ ...cardStyle, marginTop: "40px" }}>
          <h2>AI Insight</h2>
          <p style={{ whiteSpace: "pre-line" }}>{aiInsight}</p>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "10px",
  border: "none",
  color: "black",
};

const greenButton = {
  marginTop: "15px",
  padding: "10px",
  width: "100%",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg,#22c55e,#16a34a)",
  color: "white",
  cursor: "pointer",
};

const redButton = {
  marginTop: "15px",
  padding: "10px",
  width: "100%",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(90deg,#ef4444,#dc2626)",
  color: "white",
  cursor: "pointer",
};

const cardStyle = {
  marginTop: "40px",
  padding: "30px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
};

const progressBarBackground = {
  background: "#1e293b",
  borderRadius: "10px",
  height: "12px",
  marginTop: "10px",
};

export default Dashboard;
