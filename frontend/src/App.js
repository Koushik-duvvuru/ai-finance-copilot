import { motion } from "framer-motion";
import AddExpense from "./pages/AddExpense";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-black to-blue-900 opacity-80 animate-pulse"></div>

      <div className="relative z-10 p-10">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl font-extrabold text-center mb-12 tracking-wider"
        >
          AI Finance Copilot 🚀
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-10">
          <AddExpense />
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
