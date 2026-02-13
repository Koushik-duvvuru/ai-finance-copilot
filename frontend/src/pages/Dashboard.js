import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  const fetchExpenses = async () => {
    const res = await API.get("/expenses/1");
    setExpenses(res.data);
  };

  const fetchSummary = async () => {
    const res = await API.get("/summary/1");
    setSummary(res.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-blue-500/20 hover:shadow-blue-500/40 transition duration-300"
    >
      <h2 className="text-3xl font-bold mb-6 text-blue-400">
        Financial Dashboard
      </h2>

      {summary && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          {/* Income */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="bg-gradient-to-r from-green-500/20 to-green-700/20 p-4 rounded-xl border border-green-400/20"
          >
            <p className="text-sm text-gray-300">Total Income</p>
            <p className="text-2xl font-bold text-green-400">
              ₹{summary.total_income}
            </p>
          </motion.div>

          {/* Expense */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="bg-gradient-to-r from-red-500/20 to-red-700/20 p-4 rounded-xl border border-red-400/20"
          >
            <p className="text-sm text-gray-300">Total Expense</p>
            <p className="text-2xl font-bold text-red-400">
              ₹{summary.total_expense}
            </p>
          </motion.div>

          {/* Savings */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="bg-gradient-to-r from-blue-500/20 to-blue-700/20 p-4 rounded-xl border border-blue-400/20"
          >
            <p className="text-sm text-gray-300">Savings</p>
            <p className="text-2xl font-bold text-blue-400">
              ₹{summary.savings}
            </p>
          </motion.div>

          {/* Savings % */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="bg-gradient-to-r from-purple-500/20 to-purple-700/20 p-4 rounded-xl border border-purple-400/20"
          >
            <p className="text-sm text-gray-300">Savings %</p>
            <p className="text-2xl font-bold text-purple-400">
              {summary.savings_percent}%
            </p>
          </motion.div>

        </div>
      )}

      {/* Expenses List */}
      <h3 className="text-xl font-semibold mb-4 text-gray-200">
        Recent Expenses
      </h3>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {expenses.map((expense) => (
          <motion.div
            key={expense.id}
            whileHover={{ scale: 1.03 }}
            className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-200"
          >
            <div className="flex justify-between">
              <span className="text-gray-300">{expense.category}</span>
              <span className="font-semibold text-white">
                ₹{expense.amount}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Dashboard;
