import React, { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";


function AddExpense() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await API.post("/expenses", {
      amount: parseFloat(amount),
      category: category,
      date: "2026-02-13",
      user_id: 1,
    });

    alert("Expense Added!");
  };

  return (
  <motion.div
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition duration-300"
  >
    <h2 className="text-3xl font-bold mb-6 text-purple-400">
      Add Expense
    </h2>

    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="number"
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
        className="p-3 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-purple-500 transition"
      />

      <input
        type="text"
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
        className="p-3 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-purple-500 transition"
      />

      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-500 hover:scale-110 transition transform duration-200 p-3 rounded-xl font-bold shadow-lg shadow-purple-600/40"
      >
        Add Expense
      </button>
    </form>
  </motion.div>
);

}

export default AddExpense;
