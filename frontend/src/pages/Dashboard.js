import React, { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [aiInsight, setAiInsight] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // ---------------------------
  // Fetch Data
  // ---------------------------
  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses/1");
      setExpenses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await API.get("/summary/1");
      setSummary(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------
  // AI Streaming (Fixed)
  // ---------------------------
  const fetchAIStream = async () => {
    try {
      setAiInsight("");
      setLoadingAI(true);

      const response = await fetch("http://127.0.0.1:8000/ai-stream/1");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";

      // Collect full streamed text
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
      }

      // Safe typing effect (no skipped letters, no undefined)
      let index = 0;

      const interval = setInterval(() => {
        if (index >= fullText.length) {
          clearInterval(interval);
          setLoadingAI(false);
          return;
        }

        setAiInsight(fullText.slice(0, index + 1));
        index++;
      }, 30); // increase number for slower typing

    } catch (error) {
      console.error(error);
      setLoadingAI(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div
      style={{
        minHeight: "0vh",
        borderRadius: "30px",
        padding: "40px",
        background: "linear-gradient(to right, #1e1b4b, #000000)",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>AI Finance Copilot 🚀</h1>

      {/* TOP TWO CARDS ONLY */}
      <div style={{ display: "flex", gap: "40px" }}>

        {/* LEFT CARD */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            padding: "30px",
            borderRadius: "20px",
          }}
        >
          <h2>Financial Dashboard</h2>

          {summary && (
            <>
              <p><strong>Total Income:</strong> ₹{Number(summary.total_income).toLocaleString("en-IN")}</p>
              <p><strong>Total Expense:</strong> ₹{Number(summary.total_expense).toLocaleString("en-IN")}</p>
              <p><strong>Savings:</strong> ₹{Number(summary.savings).toLocaleString("en-IN")}</p>
              <p><strong>Savings %:</strong> {summary.savings_percent}%</p>
              <p><strong>Financial Score:</strong> {summary.financial_score}/100</p>
            </>
          )}

          <button
            onClick={fetchAIStream}
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              background: "#7c3aed",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loadingAI ? "Generating..." : "Generate AI Insight"}
          </button>
        </div>

        {/* RIGHT CARD */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            padding: "30px",
            borderRadius: "20px",
          }}
        >
          <h2>Recent Expenses</h2>

          {expenses.length === 0 ? (
            <p>No expenses yet.</p>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} style={{ marginBottom: "10px" }}>
                {expense.category} — ₹{Number(expense.amount).toLocaleString("en-IN")}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SEPARATE AI DIV BELOW */}
      {aiInsight && (
        <div
          style={{
            marginTop: "50px",
            background: "rgba(255,255,255,0.08)",
            padding: "30px",
            borderRadius: "20px",
            width: "100%",
          }}
        >
          <h2>AI Financial Insight</h2>
          <p style={{ whiteSpace: "pre-line", fontSize: "18px" }}>
            {aiInsight}
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
