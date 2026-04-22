import { useState } from "react";
import CategoryDistribution from "./components/CategoryDistribution";
import MonthlySpending from "./components/MonthlySpending";
import StatCard from "./components/statCard";
import TransactionList from "./components/TransactionList";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="p-10">
      <Navbar></Navbar>
      <StatCard></StatCard>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <div className="lg:col-span-2 animate-fade-in">
          <MonthlySpending/>
        </div>
        <div className="animate-fade-in">
          <CategoryDistribution/>
        </div>
      </div>
      <TransactionList></TransactionList>
    </div>
  );
}

export default App;

